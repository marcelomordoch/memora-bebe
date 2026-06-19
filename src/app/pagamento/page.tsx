'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Mapa de produtos ──────────────────────────────────────────────────────────
function getProductInfo(params: URLSearchParams) {
  const type = params.get('type') || 'upgrade'
  const plan = params.get('plan') || 'premium'
  const billing = params.get('billing') || 'monthly'
  const amount = params.get('amount') || '49.90'

  if (type === 'upgrade') {
    return {
      type, plan, billing, amount,
      name: `Plano Premium — ${billing === 'yearly' ? 'Anual' : 'Mensal'}`,
      price: billing === 'yearly' ? 'R$ 249,90/ano' : 'R$ 29,90/mês',
      icon: '👑',
    }
  }
  return {
    type, plan, billing, amount,
    name: `Gift Card Memora Bebê`,
    price: `R$ ${parseFloat(amount).toFixed(2).replace('.', ',')}`,
    icon: '🎁',
  }
}

// ── Formulário Stripe ─────────────────────────────────────────────────────────
function CheckoutForm({ productName, onSuccess }: { productName: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: submitErr } = await elements.submit()
    if (submitErr) { setError(submitErr.message || 'Erro ao processar.'); setLoading(false); return }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/pagamento/sucesso' },
      redirect: 'if_required',
    })

    if (confirmErr) {
      setError(confirmErr.message || 'Pagamento recusado.')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px', border: '1.5px solid var(--border-subtle)' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div style={{ background: 'var(--rose-100)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Icon name="alert-circle" size={18} color="var(--danger)" />
          <p style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>
        </div>
      )}

      <Button type="submit" fullWidth size="lg" loading={loading} disabled={!stripe}>
        Pagar agora
      </Button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon name="shield" size={14} color="var(--success)" />
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Pagamento seguro via Stripe
        </span>
      </div>
    </form>
  )
}

// ── Tela de sucesso ───────────────────────────────────────────────────────────
function SuccessScreen({ product }: { product: ReturnType<typeof getProductInfo> }) {
  const router = useRouter()
  const { setPlan } = useApp()

  useEffect(() => {
    if (product.type === 'upgrade') setPlan('premium')
  }, []) // eslint-disable-line

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 24px', textAlign: 'center' }} className="animate-scale-in">
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="check" size={44} color="var(--success)" strokeWidth={2.5} />
      </div>

      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-strong)', marginBottom: 8 }}>
          Pagamento aprovado! 🎉
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          {product.type === 'upgrade'
            ? 'Seu plano Premium foi ativado. Aproveite todos os recursos!'
            : `Gift Card de ${product.price} adicionado à sua conta.`}
        </p>
      </div>

      <div style={{ background: 'var(--violet-50)', borderRadius: 18, padding: '16px 20px', width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 32 }}>{product.icon}</span>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: 0 }}>{product.name}</p>
          <p style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--font-body)', margin: 0 }}>{product.price}</p>
        </div>
      </div>

      <Button fullWidth size="lg" onClick={() => router.push('/inicio')}>
        Ir para o início
      </Button>
    </div>
  )
}

// ── Conteúdo principal ────────────────────────────────────────────────────────
function PagamentoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const product = getProductInfo(params)

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: product.type,
        plan: product.plan,
        billing: product.billing,
        amount: product.amount,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setClientSecret(data.clientSecret)
        setLoading(false)
      })
      .catch(() => { setError('Erro ao conectar. Tente novamente.'); setLoading(false) })
  }, []) // eslint-disable-line

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <div style={{ background: '#fff' }}>
        <StatusBar />
        <ScreenHeader title="Pagamento" onBack={() => router.back()} />
      </div>

      {success ? (
        <SuccessScreen product={product} />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Banner Sandbox */}
          <div style={{ background: 'var(--warning-soft)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, border: '1px solid var(--warning)' }}>
            <span style={{ fontSize: 18 }}>🧪</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--warning)', margin: 0 }}>AMBIENTE DE TESTE (Stripe Sandbox)</p>
              <p style={{ fontSize: 12, color: 'var(--warning)', fontFamily: 'var(--font-body)', margin: 0 }}>Nenhuma cobrança real será efetuada.</p>
            </div>
          </div>

          {/* Resumo do pedido */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: 20, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 36 }}>{product.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: 0 }}>{product.name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>{product.price}</p>
            </div>
          </div>

          {/* Cartão de teste */}
          <div style={{ background: 'var(--violet-50)', borderRadius: 14, padding: '12px 14px', marginBottom: 20, border: '1px dashed var(--violet-200)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--accent)', margin: '0 0 6px' }}>CARTÃO DE TESTE</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-body)', margin: 0, lineHeight: 1.7 }}>
              Número: <strong>4242 4242 4242 4242</strong><br />
              Validade: qualquer data futura &nbsp;•&nbsp; CVV: qualquer 3 dígitos
            </p>
          </div>

          {/* Stripe Elements */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--rose-100)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>{error}</p>
              <button onClick={() => router.back()} style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--text-accent)', fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                Voltar
              </button>
            </div>
          )}

          {clientSecret && !error && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#6B53AE',
                    colorBackground: '#ffffff',
                    colorText: '#2E2C4A',
                    colorDanger: '#C56B6B',
                    fontFamily: 'Inter, sans-serif',
                    borderRadius: '14px',
                    spacingUnit: '4px',
                  },
                },
                locale: 'pt-BR',
              }}
            >
              <CheckoutForm productName={product.name} onSuccess={() => setSuccess(true)} />
            </Elements>
          )}
        </div>
      )}
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function PagamentoPage() {
  return (
    <Suspense fallback={
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <PagamentoContent />
    </Suspense>
  )
}
