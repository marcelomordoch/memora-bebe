'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const SKIP_PATHS = ['/criar-bebe', '/onboarding', '/register', '/login']

// Horizontal alignment of the pulse ring and tooltip arrow (% from left of screen)
type Target = null | 'fab' | 'memories' | 'achievements' | 'profile' | 'home'

const STEPS: { title: string; text: string; target: Target }[] = [
  {
    title: 'Bem-vindo ao Memora Bebê! 💜',
    text: 'Vamos te mostrar como usar o app. Toque em Próximo para continuar.',
    target: null,
  },
  {
    title: 'Início',
    text: 'Aqui você vê o resumo das últimas memórias e o progresso do seu bebê.',
    target: 'home',
  },
  {
    title: 'Registrar memórias',
    text: 'Toque no botão + para adicionar fotos, vídeos, áudios e histórias do seu bebê.',
    target: 'fab',
  },
  {
    title: 'Memórias',
    text: 'Veja todas as memórias organizadas por fase da vida do bebê. Use a busca para encontrar qualquer momento.',
    target: 'memories',
  },
  {
    title: 'Conquistas',
    text: 'A cada memória registrada você desbloqueia conquistas e acumula XP na Árvore da Vida.',
    target: 'achievements',
  },
  {
    title: 'Perfil',
    text: 'Gerencie seu perfil, plano e configurações por aqui.',
    target: 'profile',
  },
]

// Approximate horizontal center of each bottom-nav item (% of screen width)
const TARGET_LEFT: Record<Exclude<Target, null>, string> = {
  home:         '10%',
  memories:     '28%',
  fab:          '50%',
  achievements: '72%',
  profile:      '90%',
}

export default function TutorialModal() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const onSkipPath = SKIP_PATHS.some(p => pathname.startsWith(p))
    if (!onSkipPath && localStorage.getItem('tutorial_seen') !== '1') {
      setVisible(true)
    }
  }, [pathname])

  function close() {
    localStorage.setItem('tutorial_seen', '1')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else close()
  }

  function prev() {
    if (step > 0) setStep(s => s - 1)
  }

  if (!visible) return null

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const leftPct = current.target ? TARGET_LEFT[current.target] : null

  return (
    <>
      {/* Pulse ring on the target nav item */}
      {current.target && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 16px) + 4px)',
            left: leftPct!,
            transform: 'translateX(-50%)',
            width: current.target === 'fab' ? 64 : 52,
            height: current.target === 'fab' ? 64 : 52,
            borderRadius: '50%',
            border: '2.5px solid #6B53AE',
            animation: 'tour-pulse 1.4s ease-out infinite',
            pointerEvents: 'none',
            zIndex: 1998,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 16px) + 86px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 390,
          background: 'var(--surface-card)',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 1999,
          overflow: 'visible',
        }}
      >
        {/* Arrow pointing down to the target */}
        {current.target && (
          <div style={{
            position: 'absolute',
            bottom: -9,
            left: leftPct!,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '9px solid var(--surface-card)',
          }} />
        )}

        <div style={{ padding: '18px 18px 14px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-body)', background: 'var(--violet-50)', borderRadius: 999, padding: '3px 10px' }}>
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Content */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-strong)', margin: '0 0 6px' }}>
            {current.title}
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 0 14px' }}>
            {current.text}
          </p>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 999, background: i === step ? 'var(--accent)' : 'var(--border-strong)', transition: 'width 0.2s, background 0.2s' }} />
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!isFirst && (
              <button
                onClick={prev}
                style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid var(--border-strong)', background: 'var(--surface-card)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-body)', cursor: 'pointer' }}
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={next}
              style={{ flex: 2, padding: '11px 0', borderRadius: 12, border: 'none', background: 'var(--gradient-brand)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer', boxShadow: 'var(--shadow-accent)' }}
            >
              {isLast ? 'Concluir 💜' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tour-pulse {
          0%   { opacity: 1; box-shadow: 0 0 0 0 rgba(107,83,174,0.45); }
          70%  { opacity: 0.6; box-shadow: 0 0 0 14px rgba(107,83,174,0); }
          100% { opacity: 1; box-shadow: 0 0 0 0 rgba(107,83,174,0); }
        }
      `}</style>
    </>
  )
}
