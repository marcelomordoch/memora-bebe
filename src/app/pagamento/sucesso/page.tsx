'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'

function SucessoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { setPlan } = useApp()
  const handled = useRef(false)

  const type = params.get('type') || 'upgrade'
  const paymentIntent = params.get('payment_intent')
  const redirectStatus = params.get('redirect_status')
  const billing = params.get('billing') || 'monthly'

  const isUpgrade = type === 'upgrade'

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const shouldUpgrade = isUpgrade && (redirectStatus === 'succeeded' || !redirectStatus)
    if (!shouldUpgrade) return

    // Atualiza estado local imediatamente
    setPlan('premium')

    // Persiste no banco via API route server-side (usa sessão, não depende de uid na URL)
    fetch('/api/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billing }),
    }).then(r => r.json()).then(d => {
      if (d.success) console.log('[sucesso] premium ativado até', d.expiresAt)
      else console.error('[sucesso] upgrade falhou:', d.error)
    }).catch(console.error)
  }, []) // eslint-disable-line

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minHeight: '100vh' }}>
      <StatusBar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: '0 24px',
          textAlign: 'center',
        }}
        className="animate-scale-in"
      >
        {/* Check icon */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'var(--success-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={48} color="var(--success)" strokeWidth={2.5} />
        </div>

        {/* Title + description */}
        <div>
          <h1 style={{
            fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 26,
            color: '#2E2C4A', marginBottom: 10,
          }}>
            Pagamento aprovado! 🎉
          </h1>
          <p style={{
            fontSize: 15, color: '#8B89B0',
            fontFamily: 'Inter,sans-serif', lineHeight: 1.7, maxWidth: 300, margin: '0 auto',
          }}>
            {isUpgrade
              ? 'Seu plano Premium foi ativado com sucesso. Agora você pode enviar fotos, vídeos e áudios!'
              : 'Seu Gift Card foi processado. O código será enviado por e-mail em instantes.'}
          </p>
        </div>

        {/* Payment ID */}
        {paymentIntent && (
          <div style={{
            background: 'var(--surface-sunken)', borderRadius: 12,
            padding: '10px 16px', width: '100%',
          }}>
            <p style={{ fontSize: 11, color: '#8B89B0', fontFamily: 'Inter,sans-serif', margin: 0 }}>
              ID do pagamento:{' '}
              <code style={{ fontSize: 11, fontFamily: 'monospace' }}>
                {paymentIntent}
              </code>
            </p>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <Button fullWidth size="lg" onClick={() => router.push('/inicio')}>
            Ir para o início
          </Button>
          {isUpgrade && (
            <Button fullWidth variant="secondary" onClick={() => router.push('/compor')}>
              Registrar minha primeira memória 📸
            </Button>
          )}
          {!isUpgrade && (
            <Button fullWidth variant="secondary" onClick={() => router.push('/perfil/loja/gift-cards')}>
              Ver meus gift cards
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<div style={{ flex: 1, minHeight: '100vh' }} />}>
      <SucessoContent />
    </Suspense>
  )
}
