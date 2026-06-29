'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'
import { createMemory, unlockAchievement, getMemories } from '@/lib/supabase/queries'
import { uploadFile, generateFilePath } from '@/lib/supabase/storage'
import { MEMORY_COLORS } from '@/lib/utils'

// ── Upgrade modal ──────────────────────────────────────────────────────────────
function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18,17,26,.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)' }} />
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--violet-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="lock" size={32} color="var(--accent)" strokeWidth={2} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)', margin: 0, textAlign: 'center' }}>
          Recurso Premium 👑
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textAlign: 'center', margin: 0 }}>
          Faça upgrade para enviar fotos, vídeos e áudios para as memórias de {'{bebê}'}.
        </p>
        <Link href="/planos" style={{ display: 'block', width: '100%', padding: '15px 0', borderRadius: 16, background: 'var(--gradient-brand)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, textAlign: 'center', textDecoration: 'none', boxShadow: 'var(--shadow-accent)' }} onClick={onClose}>
          Ver Planos Premium
        </Link>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>
          Agora não
        </button>
      </div>
    </div>
  )
}

// ── Media form (fotos / vídeo) ─────────────────────────────────────────────────
function MediaForm({
  type,
  onClose,
  onSaved,
}: {
  type: 'foto' | 'video'
  onClose: () => void
  onSaved: () => void
}) {
  const { baby, user } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isPhoto = type === 'foto'
  const accept = isPhoto ? 'image/*' : 'video/*'
  const multiple = isPhoto

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit() {
    if (!files.length || !title.trim() || !baby?.id || !user?.id) {
      setError(`Selecione ${isPhoto ? 'pelo menos uma foto' : 'um vídeo'} e adicione um título.`)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const lifeStage = baby.status === 'gestacao' ? 'gestacao' : '0-1'
      const bucket = isPhoto ? 'memories' : 'videos'

      // Upload todos os arquivos em paralelo
      const urls = await Promise.all(
        files.map(async f => {
          const path = generateFilePath(user.id, f.name)
          return uploadFile(bucket, path, f)
        })
      )

      // Criar memória com a primeira URL como media_url e o array completo em media_urls
      await createMemory({
        baby_id: baby.id,
        user_id: user.id,
        type,
        title: title.trim(),
        body: '',
        life_stage: lifeStage,
        media_url: urls[0],
        media_urls: urls.length > 1 ? urls : undefined,
        bg_color: MEMORY_COLORS[lifeStage],
        week: baby.week,
      } as Parameters<typeof createMemory>[0])

      // Conquista fotógrafo
      if (isPhoto) {
        const allMems = await getMemories(baby.id)
        const photoCount = allMems.filter(m => m.type === 'foto').length
        if (photoCount >= 5) unlockAchievement(baby.id, user.id, 'fotografo', 150).catch(() => {})
      }

      previews.forEach(p => URL.revokeObjectURL(p))
      onSaved()
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18,17,26,.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)', alignSelf: 'center' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-strong)', margin: 0 }}>
          {isPhoto ? '📷 Adicionar Fotos' : '🎬 Adicionar Vídeo'}
        </h3>

        {/* Preview */}
        {previews.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {previews.map((p, i) => (
              <div key={i} style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 10, overflow: 'hidden', background: '#000', position: 'relative' }}>
                {isPhoto
                  ? <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <video src={p} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                }
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ height: 120, borderRadius: 14, border: '2px dashed var(--border-strong)', background: 'var(--violet-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
          >
            <Icon name={isPhoto ? 'camera' : 'video'} size={28} color="var(--accent)" />
            <span style={{ fontSize: 14, color: 'var(--accent)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              {isPhoto ? 'Selecionar fotos' : 'Selecionar vídeo'}
            </span>
            {isPhoto && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Você pode selecionar várias</span>}
          </button>
        )}

        <input ref={fileInputRef} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={handleFileChange} />

        {previews.length > 0 && (
          <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-body)', fontWeight: 600, textAlign: 'left' }}>
            + {isPhoto ? 'Adicionar mais fotos' : 'Trocar vídeo'}
          </button>
        )}

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>Título</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={isPhoto ? 'Ex: Primeiro ultrassom!' : 'Ex: Primeiros movimentos...'} style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 12, fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-strong)', background: '#fff' }} />
        </div>

        {error && <p style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>}

        <Button fullWidth onClick={handleSubmit} loading={submitting} disabled={!files.length || !title.trim()}>
          Salvar memória 💜
        </Button>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────────
const TYPE_CARDS = [
  { type: 'foto',     label: 'Foto',     icon: 'camera',    iconColor: '#6B53AE', tileBg: '#E7E1F4', free: false },
  { type: 'video',    label: 'Vídeo',    icon: 'video',     iconColor: '#C76FB0', tileBg: '#F9E7F2', free: false },
  { type: 'audio',    label: 'Áudio',    icon: 'mic',       iconColor: '#4F9E7C', tileBg: '#E2F1EA', free: false },
  { type: 'historia', label: 'História', icon: 'file-text', iconColor: '#C9974A', tileBg: '#F5ECD8', free: true  },
] as const

const PROMPTS = ['Como foi o dia hoje?', 'O que me surpreendeu?', 'Uma coisa que quero lembrar...']

export default function ComporPage() {
  const router = useRouter()
  const { plan, baby } = useApp()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [mediaType, setMediaType] = useState<'foto' | 'video' | null>(null)

  function handleCard(type: typeof TYPE_CARDS[number]['type'], free: boolean) {
    if (!free && plan === 'free') { setShowUpgrade(true); return }
    if (type === 'historia') { router.push('/compor/historia'); return }
    if (type === 'audio')    { router.push('/compor/audio');   return }
    if (type === 'foto' || type === 'video') { setMediaType(type); return }
  }

  return (
    <>
      <StatusBar />
      <div style={{ background: 'var(--surface-page)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <ScreenHeader title="" />

        <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)', margin: '0 0 6px' }}>
              Registrar Memória
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
              Que tipo de memória você quer criar?
            </p>
          </div>

          {/* Type grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {TYPE_CARDS.map(card => (
              <button
                key={card.type}
                onClick={() => handleCard(card.type, card.free)}
                style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: '26px 10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', boxShadow: 'var(--shadow-sm)', position: 'relative', transition: 'transform 120ms' }}
              >
                {!card.free && plan === 'free' && (
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: 'var(--warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="lock" size={11} color="var(--warning)" strokeWidth={2.5} />
                  </div>
                )}
                <div style={{ width: 60, height: 60, borderRadius: 18, background: card.tileBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={card.icon} size={28} color={card.iconColor} strokeWidth={1.8} />
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)' }}>{card.label}</span>
              </button>
            ))}
          </div>

          {/* Prompts */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: '0 0 10px' }}>Prompts de escrita</p>
            {PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => router.push(`/compor/historia?prompt=${encodeURIComponent(p)}`)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: '#fff', border: 'none', cursor: 'pointer', marginBottom: 8, boxShadow: 'var(--shadow-sm)', textAlign: 'left' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--violet-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="file-text" size={18} color="var(--accent)" />
                </div>
                <span style={{ fontSize: 14, color: 'var(--text-body)', fontFamily: 'var(--font-body)', flex: 1 }}>{p}</span>
                <Icon name="chevron-right" size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      {mediaType && (
        <MediaForm
          type={mediaType}
          onClose={() => setMediaType(null)}
          onSaved={() => { setMediaType(null); router.push('/memorias') }}
        />
      )}
    </>
  )
}
