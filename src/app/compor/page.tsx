'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'

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
  const { plan } = useApp()
  const [showUpgrade, setShowUpgrade] = useState(false)

  function handleCardPress(card: TypeCard) {
    if (!card.free && plan === 'free') {
      setShowUpgrade(true)
      return
    }
    if (card.type === 'historia') {
      router.push('/compor/historia')
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
    </>
  )
}
