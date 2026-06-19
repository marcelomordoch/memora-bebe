'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'

function SucessoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { setPlan } = useApp()

  const type = params.get('type') || 'upgrade'
  const paymentIntent = params.get('payment_intent')

  useEffect(() => {
    // Stripe redireciona aqui com ?payment_intent=...&payment_intent_client_secret=...&redirect_status=succeeded
    const status = params.get('redirect_status')
    if (status === 'succeeded' && type === 'upgrade') {
      setPlan('premium')
    }
  }, []) // eslint-disable-line

  const isUpgrade = type === 'upgrade'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 24px', textAlign: 'center' }} className="animate-scale-in">
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={48} color="var(--success)" strokeWidth={2.5} />
        </div>

        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--text-strong)', marginBottom: 10 }}>
            Pagamento aprovado! 🎉
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.7, maxWidth: 300 }}>
            {isUpgrade
              ? 'Seu plano Premium foi ativado com sucesso. Agora você pode enviar fotos, vídeos e áudios!'
              : 'Seu Gift Card foi processado e está disponível na sua conta.'}
          </p>
        </div>

        {paymentIntent && (
          <div style={{ background: 'var(--surface-sunken)', borderRadius: 12, padding: '10px 16px', width: '100%' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
              ID do pagamento: <code style={{ fontSize: 11 }}>{paymentIntent.slice(0, 20)}...</code>
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <Button fullWidth size="lg" onClick={() => router.push('/inicio')}>
            Ir para o início
          </Button>
          {isUpgrade && (
            <Button fullWidth variant="secondary" onClick={() => router.push('/compor')}>
              Registrar minha primeira memória 📸
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<div style={{ flex: 1 }} />}>
      <SucessoContent />
    </Suspense>
  )
}
