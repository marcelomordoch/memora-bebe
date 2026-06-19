'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import StatusBar from '@/components/ui/StatusBar'

const SLIDES = [
  { emoji: '👨‍👩‍👧', title: 'A jornada do seu bebê, registrada com amor, vivida para sempre.', sub: 'Cada momento é único e merece ser lembrado.' },
  { emoji: '📸', title: 'Fotos, vídeos, áudios e histórias únicas.', sub: 'Capture e preserve cada memória especial do jeito que ela é.' },
  { emoji: '👨‍👩‍👦', title: 'Conecte toda a família.', sub: 'Compartilhe memórias e marcos com quem você ama, onde quer que estejam.' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [slide, setSlide] = useState(0)
  const isLast = slide === SLIDES.length - 1

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />

      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)' }}>memora</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-muted)' }}>bebê</span>
        </div>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 96, lineHeight: 1 }}>{SLIDES[slide].emoji}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)', lineHeight: 1.3 }}>
          {SLIDES[slide].title}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          {SLIDES[slide].sub}
        </p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '24px 0' }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            style={{
              height: 8, borderRadius: 999, border: 'none', cursor: 'pointer',
              width: i === slide ? 22 : 8,
              background: i === slide ? 'var(--accent)' : 'var(--violet-200)',
              transition: 'width .2s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Button */}
      <div style={{ padding: '0 20px 40px' }}>
        {isLast ? (
          <Button fullWidth size="lg" onClick={() => router.push('/inicio')}>
            Começar jornada 💜
          </Button>
        ) : (
          <button
            onClick={() => setSlide(s => s + 1)}
            style={{
              width: '100%', padding: '14px 20px', borderRadius: 14,
              border: '1.5px solid var(--border-strong)', background: '#fff',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
              color: 'var(--text-strong)', cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Próximo
          </button>
        )}
      </div>
    </div>
  )
}
