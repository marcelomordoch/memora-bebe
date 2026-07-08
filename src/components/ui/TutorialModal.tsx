'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const STEPS = [
  {
    emoji: '💜',
    title: 'Bem-vindo ao Memora Bebê!',
    text: 'Aqui você registra cada momento especial da vida do seu bebê, de forma simples, segura e para sempre.',
  },
  {
    emoji: '📷',
    title: 'Registre memórias',
    text: 'Toque no botão + para adicionar fotos, vídeos, áudios e histórias. Tudo organizado num só lugar.',
  },
  {
    emoji: '📅',
    title: 'Organizado por fases',
    text: 'Suas memórias são separadas automaticamente por fase da vida: gestação, 1º ano, 2º ano e muito mais.',
  },
  {
    emoji: '🏆',
    title: 'Ganhe conquistas',
    text: 'A cada memória registrada você desbloqueia conquistas e evolui na Árvore da Vida do seu bebê.',
  },
  {
    emoji: '🔒',
    title: 'Tudo 100% privado',
    text: 'Fotos e vídeos armazenados com segurança. Só você — e quem você convidar — tem acesso.',
  },
]

const SKIP_PATHS = ['/criar-bebe', '/onboarding', '/register', '/login']

export default function TutorialModal() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

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

  function goTo(next: number) {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
    }, 180)
  }

  function handleNext() {
    if (step < STEPS.length - 1) goTo(step + 1)
    else close()
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Barra de progresso */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--border-subtle)' }}>
        <div style={{
          height: '100%',
          background: 'var(--gradient-brand)',
          width: `${((step + 1) / STEPS.length) * 100}%`,
          transition: 'width 0.32s cubic-bezier(0.4,0,0.2,1)',
          borderRadius: '0 999px 999px 0',
        }} />
      </div>

      {/* Pular */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '52px 24px 0' }}>
        {!isLast && (
          <button
            onClick={close}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', padding: '4px 8px' }}
          >
            Pular
          </button>
        )}
      </div>

      {/* Conteúdo do slide */}
      <div
        style={{
          flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 36px', textAlign: 'center', gap: 28,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        <div style={{
          width: 120, height: 120, borderRadius: 32,
          background: 'var(--violet-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 64, lineHeight: 1,
          boxShadow: '0 8px 32px rgba(107,83,174,0.18)',
        }}>
          {current.emoji}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
            color: 'var(--text-strong)', margin: 0, lineHeight: 1.25,
          }}>
            {current.title}
          </h1>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
            lineHeight: 1.65, margin: 0,
          }}>
            {current.text}
          </p>
        </div>
      </div>

      {/* Dots + botão */}
      <div style={{ padding: '0 24px 52px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => i < step && goTo(i)}
              style={{
                width: i === step ? 24 : 8, height: 8,
                borderRadius: 999,
                background: i === step ? 'var(--accent)' : i < step ? 'var(--border-strong)' : 'var(--border-subtle)',
                border: 'none', padding: 0, cursor: i < step ? 'pointer' : 'default',
                transition: 'width 0.22s, background 0.22s',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            width: '100%', maxWidth: 400, padding: '17px 0',
            borderRadius: 18, border: 'none',
            background: 'var(--gradient-brand)', color: '#fff',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
            cursor: 'pointer', boxShadow: 'var(--shadow-accent)',
            letterSpacing: 0.2,
          }}
        >
          {isLast ? 'Começar! 💜' : 'Próximo →'}
        </button>
      </div>
    </div>
  )
}
