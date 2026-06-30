'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { createMemory, unlockAchievement } from '@/lib/supabase/queries'
import { uploadFile, generateFilePath } from '@/lib/supabase/storage'
import { MEMORY_COLORS } from '@/lib/utils'

type RecState = 'idle' | 'recording' | 'paused' | 'done'

export default function AudioPage() {
  const router = useRouter()
  const { baby, user } = useApp()

  const [recState, setRecState] = useState<RecState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const isFinalStopRef = useRef(false)
  const mimeTypeRef = useRef('audio/webm')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, []) // eslint-disable-line

  function startTimer() {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  // Inicia um "segmento" de gravação na stream já existente.
  // Usamos start/stop por segmento (em vez de pause()/resume() nativos do MediaRecorder,
  // que têm suporte inconsistente em navegadores mobile) para garantir pausar/retomar confiável.
  function startSegment(stream: MediaStream) {
    const mr = new MediaRecorder(stream, { mimeType: mimeTypeRef.current })
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    mr.onstop = () => {
      if (isFinalStopRef.current) {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setRecState('done')
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      // Se não for parada final (foi pausa), não faz nada — handleResume cria novo segmento
    }
    mr.start(100)
    mediaRecorderRef.current = mr
  }

  async function handleStart() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      mimeTypeRef.current = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      chunksRef.current = []
      isFinalStopRef.current = false
      startSegment(stream)
      setSeconds(0)
      startTimer()
      setRecState('recording')
    } catch {
      setError('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }

  function handlePause() {
    isFinalStopRef.current = false
    mediaRecorderRef.current?.stop()
    stopTimer()
    setRecState('paused')
  }

  function handleResume() {
    if (!streamRef.current) return
    isFinalStopRef.current = false
    startSegment(streamRef.current)
    startTimer()
    setRecState('recording')
  }

  function handleStop() {
    isFinalStopRef.current = true
    stopTimer()
    mediaRecorderRef.current?.stop()
  }

  function handleMainButton() {
    if (recState === 'idle') handleStart()
    else if (recState === 'recording') handlePause()
    else if (recState === 'paused') handleResume()
  }

  function togglePlay() {
    if (!audioRef.current || !audioUrl) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  function handleDiscard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    stopTimer()
    setAudioUrl(null)
    setAudioBlob(null)
    setSeconds(0)
    setPlaying(false)
    setRecState('idle')
    setTitle('')
    setError('')
  }

  async function handleSave() {
    if (!audioBlob || !baby?.id || !user?.id) return
    if (!title.trim()) { setError('Dê um título para o áudio.'); return }
    setSaving(true)
    setError('')
    try {
      const lifeStage = baby.status === 'gestacao' ? 'gestacao' : '0-1'
      const ext = audioBlob.type.includes('webm') ? 'webm' : 'ogg'
      const file = new File([audioBlob], `audio_${Date.now()}.${ext}`, { type: audioBlob.type })
      const path = generateFilePath(user.id, file.name)
      const mediaUrl = await uploadFile('audio', path, file)
      await createMemory({
        baby_id: baby.id,
        user_id: user.id,
        type: 'audio',
        title: title.trim(),
        body: '',
        life_stage: lifeStage,
        media_url: mediaUrl,
        bg_color: MEMORY_COLORS[lifeStage],
        emoji: '🎙️',
        week: baby.week,
      })
      unlockAchievement(baby.id, user.id, 'narrador', 100).catch(() => {})
      router.push('/memorias')
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.'
      setError(msg)
      setSaving(false)
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const isRecordingOrPaused = recState === 'recording' || recState === 'paused'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />
      <ScreenHeader title="Gravar Áudio" onBack={() => router.back()} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 40px', gap: 28 }}>

        {recState !== 'done' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)', margin: '0 0 8px' }}>
              Gravar memória em áudio
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
              {recState === 'idle' && 'Toque para começar a gravar.'}
              {recState === 'recording' && 'Gravando... toque para pausar.'}
              {recState === 'paused' && 'Pausado. Toque para continuar.'}
            </p>
          </div>
        )}

        {error && <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>{error}</p>}

        {recState !== 'done' && (
          <>
            {isRecordingOrPaused && (
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: recState === 'recording' ? 'var(--danger)' : 'var(--text-muted)', margin: 0 }}>
                {formatTime(seconds)}
              </p>
            )}

            <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {recState === 'recording' && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(197,107,107,.15)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              )}
              <button
                onClick={handleMainButton}
                style={{
                  width: recState === 'idle' ? 140 : 120, height: recState === 'idle' ? 140 : 120, borderRadius: '50%',
                  background: recState === 'recording' ? 'var(--danger)' : 'var(--gradient-brand)',
                  border: recState !== 'idle' ? '4px solid rgba(197,107,107,.25)' : 'none',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: recState === 'recording' ? '0 4px 20px rgba(197,107,107,.4)' : 'var(--shadow-accent)',
                  transition: 'all 200ms ease',
                }}
              >
                <Icon name={recState === 'recording' ? 'pause' : 'mic'} size={recState === 'idle' ? 48 : 36} color="#fff" strokeWidth={1.5} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.9)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {recState === 'idle' && 'Gravar'}
                  {recState === 'recording' && 'Pausar'}
                  {recState === 'paused' && 'Continuar'}
                </span>
              </button>
            </div>

            {isRecordingOrPaused && (
              <button onClick={handleStop} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-sunken)', border: 'none', borderRadius: 999, padding: '10px 20px', cursor: 'pointer' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--text-strong)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>Finalizar gravação</span>
              </button>
            )}
          </>
        )}

        {recState === 'done' && audioUrl && (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)', margin: '0 0 6px' }}>
                Áudio gravado! 🎙️
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
                {formatTime(seconds)} de gravação
              </p>
            </div>

            <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} style={{ display: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button onClick={handleDiscard} style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--rose-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash" size={22} color="var(--rose-500)" />
              </button>
              <button onClick={togglePlay} style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--gradient-brand)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-accent)' }}>
                <Icon name={playing ? 'pause' : 'play'} size={36} color="#fff" strokeWidth={1.5} />
              </button>
              <div style={{ width: 52 }} />
            </div>

            <div style={{ width: '100%' }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>
                Título da memória
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Coração da Sofia batendo forte..."
                style={{ width: '100%', padding: '13px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 14, fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-strong)', background: '#fff' }}
              />
            </div>

            <Button fullWidth size="lg" onClick={handleSave} loading={saving} disabled={!title.trim()}>
              Salvar memória 💜
            </Button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
