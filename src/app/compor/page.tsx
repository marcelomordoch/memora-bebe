'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { createMemory, uploadMemoryMedia, unlockAchievement, getMemories } from '@/lib/supabase/queries'
import { MEMORY_COLORS } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type MemoryType = 'foto' | 'video' | 'audio' | 'historia'

interface TypeCard {
  type: MemoryType
  label: string
  icon: string
  iconColor: string
  tileBg: string
  free: boolean
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CARDS: TypeCard[] = [
  {
    type: 'foto',
    label: 'Foto',
    icon: 'camera',
    iconColor: '#6B53AE',
    tileBg: '#E7E1F4',
    free: false,
  },
  {
    type: 'video',
    label: 'Vídeo',
    icon: 'video',
    iconColor: '#C76FB0',
    tileBg: '#F9E7F2',
    free: false,
  },
  {
    type: 'audio',
    label: 'Áudio',
    icon: 'mic',
    iconColor: '#4F9E7C',
    tileBg: '#E2F1EA',
    free: false,
  },
  {
    type: 'historia',
    label: 'História',
    icon: 'file-text',
    iconColor: '#C9974A',
    tileBg: '#F5ECD8',
    free: true,
  },
]

const PROMPTS = [
  'Como foi o dia hoje?',
  'O que me surpreendeu?',
  'Uma coisa que quero lembrar...',
]

// ─── Upgrade modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(18,17,26,.6)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '28px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)', marginBottom: 4 }} />

        {/* Lock icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'var(--violet-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="lock" size={32} color="var(--accent)" strokeWidth={2} />
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--text-strong)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Recurso Premium 📸
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-body)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Upgrade para o plano <strong>Premium</strong> para enviar fotos, vídeos e áudios e eternizar cada detalhe da sua jornada.
        </p>

        {/* CTA */}
        <Link
          href="/planos"
          style={{
            width: '100%',
            display: 'block',
            padding: '15px 0',
            borderRadius: 16,
            background: 'var(--gradient-brand)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 15,
            textAlign: 'center',
            textDecoration: 'none',
            boxShadow: 'var(--shadow-accent)',
          }}
          onClick={onClose}
        >
          Ver Planos Premium
        </Link>

        {/* Dismiss */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-muted)',
          }}
        >
          Agora não
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComporPage() {
  const router = useRouter()
  const { plan, baby, user } = useApp()
  const [showUpgrade, setShowUpgrade] = useState(false)

  // Photo form state
  const [showPhotoForm, setShowPhotoForm] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoTitle, setPhotoTitle] = useState('')
  const [photoSubmitting, setPhotoSubmitting] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoSubmit() {
    if (!photoFile || !photoTitle.trim() || !baby?.id || !user?.id) {
      setPhotoError('Selecione uma foto e preencha o título.')
      return
    }
    setPhotoError('')
    setPhotoSubmitting(true)
    try {
      const lifeStage = baby.status === 'gestacao' ? 'gestacao' : '0-1'
      // 1. Criar a memória primeiro
      const memory = await createMemory({
        baby_id: baby.id,
        user_id: user.id,
        type: 'foto',
        title: photoTitle.trim(),
        body: '',
        life_stage: lifeStage,
        bg_color: MEMORY_COLORS[lifeStage],
        week: baby.week,
      })
      // 2. Upload da foto para o bucket 'memories' e vincular à memória
      await uploadMemoryMedia(memory.id, photoFile, 'foto')

      // 3. Verificar conquista 'fotografo' (5 fotos)
      const allMems = await getMemories(baby.id)
      const photoCount = allMems.filter(m => m.type === 'foto').length
      if (photoCount >= 5) unlockAchievement(baby.id, user.id, 'fotografo', 150).catch(() => {})

      setShowPhotoForm(false)
      setPhotoFile(null)
      setPhotoTitle('')
      router.push('/memorias')
    } catch (err) {
      console.error(err)
      setPhotoError('Erro ao salvar. Tente novamente.')
      setPhotoSubmitting(false)
    }
  }

  function handleCardPress(card: TypeCard) {
    if (!card.free && plan === 'free') {
      setShowUpgrade(true)
      return
    }
    if (card.type === 'historia') {
      router.push('/compor/historia')
    }
    if (card.type === 'foto' && plan === 'premium') {
      setShowPhotoForm(true)
    }
  }

  function handlePromptPress(prompt: string) {
    router.push(`/compor/historia?prompt=${encodeURIComponent(prompt)}`)
  }

  return (
    <>
      <StatusBar />

      <div
        style={{
          background: 'var(--surface-page)',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ScreenHeader title="Registrar Memória" onBack={() => router.back()} />

        <div style={{ flex: 1, padding: '4px 20px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--text-muted)',
              textAlign: 'center',
              margin: 0,
              marginTop: 4,
            }}
          >
            Que tipo de memória você quer criar?
          </p>

          {/* 2×2 grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            {TYPE_CARDS.map(card => (
              <button
                key={card.type}
                onClick={() => handleCardPress(card)}
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 18,
                  boxShadow: 'var(--shadow-sm)',
                  padding: '26px 10px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform .12s ease, box-shadow .12s ease',
                }}
              >
                {/* Lock badge for premium-only on free plan */}
                {!card.free && plan === 'free' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--border-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="lock" size={11} color="#fff" strokeWidth={2.5} />
                  </div>
                )}

                {/* Icon tile */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    background: card.tileBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={card.icon} size={28} color={card.iconColor} strokeWidth={2} />
                </div>

                {/* Label */}
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 15,
                    color: 'var(--text-strong)',
                  }}
                >
                  {card.label}
                </span>
              </button>
            ))}
          </div>

          {/* Writing prompts section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 16,
                color: 'var(--text-strong)',
                margin: 0,
              }}
            >
              Prompts de escrita
            </h3>

            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 18,
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              {PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptPress(prompt)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    background: 'none',
                    border: 'none',
                    borderBottom: idx < PROMPTS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--violet-50)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="edit-3" size={16} color="var(--accent)" strokeWidth={2} />
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        color: 'var(--text-body)',
                        fontWeight: 500,
                      }}
                    >
                      {prompt}
                    </span>
                  </div>
                  <Icon name="chevron-right" size={18} color="var(--text-muted)" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade modal */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      {/* Photo form modal (premium only) */}
      {showPhotoForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18,17,26,.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowPhotoForm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E7E5F0', alignSelf: 'center', marginBottom: 4 }} />
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: '#2E2C4A', margin: 0 }}>Adicionar foto</h3>

            {/* File picker */}
            <div
              onClick={() => photoInputRef.current?.click()}
              style={{ border: '2px dashed #E7E5F0', borderRadius: 16, padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#F4F3F7' }}
            >
              {photoFile ? (
                <>
                  <Icon name="check-circle" size={32} color="#4F9E7C" />
                  <p style={{ fontSize: 13, color: '#2E2C4A', margin: 0, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>{photoFile.name}</p>
                </>
              ) : (
                <>
                  <Icon name="camera" size={32} color="#8B89B0" />
                  <p style={{ fontSize: 13, color: '#8B89B0', margin: 0, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>Toque para selecionar uma foto</p>
                </>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>Título</label>
              <input
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="Ex: Primeiro ultrassom"
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', outline: 'none', background: '#F4F3F7' }}
              />
            </div>

            {photoError && <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{photoError}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowPhotoForm(false)} style={{ flex: 1, padding: '12px 0', border: '1.5px solid #E7E5F0', borderRadius: 12, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#8B89B0', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={handlePhotoSubmit}
                disabled={photoSubmitting || !photoFile || !photoTitle.trim()}
                style={{ flex: 2, padding: '12px 0', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', cursor: photoSubmitting ? 'not-allowed' : 'pointer', opacity: photoFile && photoTitle.trim() ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {photoSubmitting ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : 'Salvar foto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
