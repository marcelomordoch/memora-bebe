'use client'

import { useEffect, useState } from 'react'

type InstallState = 'hidden' | 'android' | 'ios'

export default function InstallButton() {
  const [state, setState] = useState<InstallState>('hidden')
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Already installed as standalone — hide the button
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true

    if (isStandalone) return

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

    if (isIOS) {
      setState('ios')
      return
    }

    // Android / Chrome: wait for the browser prompt event
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as Event & { prompt: () => Promise<void> })
      setState('android')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleAndroidInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    setState('hidden')
    setDeferredPrompt(null)
  }

  if (state === 'hidden') return null

  return (
    <>
      <button
        onClick={state === 'android' ? handleAndroidInstall : () => setShowIOSGuide(true)}
        style={{
          width: '100%',
          background: 'var(--gradient-brand)',
          border: 'none',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-accent)',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 32, flexShrink: 0 }}>📲</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff', margin: 0 }}>
            Adicionar à tela inicial
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>
            Acesse o Memora como um app nativo
          </p>
        </div>
        <span style={{ fontSize: 20, color: '#fff', opacity: 0.8 }}>›</span>
      </button>

      {/* iOS guide modal */}
      {showIOSGuide && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(18,17,26,.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 44px', display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-subtle)' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 32, margin: '0 0 8px' }}>📱</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-strong)', margin: 0 }}>
                Adicionar à tela inicial
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '6px 0 0' }}>
                Siga os passos no Safari para instalar o Memora Bebê
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { step: '1', icon: '⬆️', text: 'Toque no botão Compartilhar no Safari (ícone de seta para cima na barra inferior)' },
                { step: '2', icon: '➕', text: 'Role para baixo e toque em "Adicionar à Tela de Início"' },
                { step: '3', icon: '✅', text: 'Toque em "Adicionar" no canto superior direito' },
              ].map(({ step, icon, text }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-body)' }}>{step}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 18, marginRight: 6 }}>{icon}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-body)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{text}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'var(--gradient-brand)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: '#fff', cursor: 'pointer', boxShadow: 'var(--shadow-accent)' }}
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
