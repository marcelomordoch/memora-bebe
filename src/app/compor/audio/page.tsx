'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { createMemory } from '@/lib/supabase/queries'
import { uploadFile, generateFilePath } from '@/lib/supabase/storage'
import { MEMORY_COLORS } from '@/lib/utils'

type State = 'idle' | 'recording' | 'preview' | 'saving'

export default function AudioPage() {
  const router = useRouter()
  const { baby, user } = useApp()

  const [state, setState] = useState<State>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg' })
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mr.mimeType })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        setState('preview')
      }
      mr.start(100)
      mediaRecorderRef.current = mr
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      setError('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
  }

  function togglePlay() {
    if (!audioRef.current || !audioUrl) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  async function handleSave() {
    if (!audioBlob || !baby?.id || !user?.id) return
    if (!title.trim()) { setError('Dê um título para o áudio.'); return }
    setState('saving')
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
      router.push('/memorias')
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar. Tente novamente.')
      setState('preview')
    }
  }

  function handleDiscard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setAudioBlob(null)
    setSeconds(0)
    setPlaying(false)
    setState('idle')
    setTitle('')
    setError('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />
      <ScreenHeader title="Gravar Áudio" onBack={() => router.back()} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 40px', gap: 32 }}>

        {state === 'idle' && (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)', margin: '0 0 8px' }}>
                Gravar memória em áudio
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.6 }}>
                Toque no botão e fale. Solte quando terminar.
              </p>
            </div>

            {error && <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>{error}</p>}

            {/* Big record button */}
            <button
              onMouseDown={startRecording}
              onTouchStart={e => { e.preventDefault(); startRecording() }}
              style={{
                width: 140, height: 140, borderRadius: '50%',
                background: 'var(--gradient-brand)',
                border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: 'var(--shadow-accent)',
                transition: 'transform 150ms ease',
              }}
            >
              <Icon name="mic" size={48} color="#fff" strokeWidth={1.5} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Gravar</span>
            </button>
          </>
        )}

        {state === 'recording' && (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--danger)', margin: '0 0 6px' }}>
                {formatTime(seconds)}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>Gravando...</p>
            </div>

            {/* Animated pulse */}
            <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(197,107,107,.15)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <button
                onMouseUp={stopRecording}
                onTouchEnd={e => { e.preventDefault(); stopRecording() }}
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'var(--danger)', border: '4px solid rgba(197,107,107,.3)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 20px rgba(197,107,107,.4)',
                }}
              >
                <Icon name="mic" size={40} color="#fff" strokeWidth={2} />
                <span style={{ fontSize: 12, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Soltar para parar</span>
              </button>
            </div>
          </>
        )}

        {(state === 'preview' || state === 'saving') && audioUrl && (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)', margin: '0 0 6px' }}>
                Áudio gravado! 🎙️
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
                {formatTime(seconds)} de gravação
              </p>
            </div>

            {/* Player */}
            <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} style={{ display: 'none' }} />
            <button
              onClick={togglePlay}
              style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--gradient-brand)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-accent)' }}
            >
              <Icon name={playing ? 'pause' : 'play'} size={40} color="#fff" strokeWidth={1.5} />
            </button>

            {/* Título */}
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

            {error && <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>{error}</p>}

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button fullWidth size="lg" onClick={handleSave} loading={state === 'saving'} disabled={!title.trim()}>
                Salvar memória 💜
              </Button>
              <button onClick={handleDiscard} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', padding: '8px 0' }}>
                Descartar e gravar novamente
              </button>
            </div>
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
