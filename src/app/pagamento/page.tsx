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
const PLAN_INFO: Record<string, { label: string; storage: string; emoji: string }> = {
  basico:   { label: 'Básico',   storage: '5 GB',   emoji: '📷' },
  familia:  { label: 'Família',  storage: '15 GB',  emoji: '👨‍👩‍👧' },
  memorias: { label: 'Memórias', storage: '30 GB',  emoji: '🎞️' },
  premium:  { label: 'Premium',  storage: '60 GB',  emoji: '💜' },
  pro:      { label: 'Pro',      storage: '100 GB', emoji: '🚀' },
}

function getProductInfo(params: URLSearchParams) {
  const type = params.get('type') || 'upgrade'
  const plan = params.get('plan') || 'premium'
  const billing = params.get('billing') || 'monthly'
  const price = params.get('price') || ''           // preço vindo da página de planos
  const amount = params.get('amount') || price || '9.90'
  const uid = params.get('uid') || ''
  const senderName = params.get('senderName') || ''
  const message = params.get('message') || ''

  if (type === 'upgrade') {
    const info = PLAN_INFO[plan] ?? PLAN_INFO['premium']
    const priceFormatted = price
      ? `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}/mês`
      : 'R$ 29,90/mês'
    return {
      type, plan, billing, amount, uid, senderName, message,
      name: `Plano ${info.label} — ${info.storage} de armazenamento`,
      price: priceFormatted,
      icon: info.emoji,
    }
  }
  if (type === 'credit') {
    return {
      type, plan, billing, amount, uid, senderName, message,
      name: `Adicionar créditos — R$ ${parseFloat(amount).toFixed(2).replace('.', ',')}`,
      price: `R$ ${parseFloat(amount).toFixed(2).replace('.', ',')}`,
      icon: '💰',
    }
  }
  return {
    type, plan, billing, amount, uid, senderName, message,
    name: `Gift Card Memora Bebê`,
    price: `R$ ${parseFloat(amount).toFixed(2).replace('.', ',')}`,
    icon: '🎁',
  }
}

// ── Formulário Stripe ─────────────────────────────────────────────────────────
function CheckoutForm({ productName, returnUrl, onSuccess }: { productName: string; returnUrl: string; onSuccess: () => void }) {
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
      confirmParams: { return_url: returnUrl },
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
    if (product.type === 'upgrade') {
      setPlan('premium')
      fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing: product.billing, plan: product.plan }),
      }).then(r => r.json()).then(d => {
        if (!d.success) console.error('[upgrade]', d.error)
      }).catch(console.error)
    } else if (product.type === 'credit') {
      fetch('/api/credit-topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(product.amount) }),
      }).then(r => r.json()).then(d => {
        if (!d.success) console.error('[credit-topup]', d.error)
      }).catch(console.error)
    }
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
            : product.type === 'credit'
            ? `R$ ${parseFloat(product.amount).toFixed(2).replace('.', ',')} adicionados ao seu saldo de créditos!`
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

// ── Cupom ─────────────────────────────────────────────────────────────────────
const VALID_COUPONS: Record<string, { discount: 100; label: string }> = {
  'MEMORA100': { discount: 100, label: '100% grátis — Plano Premium ativado!' },
}

function CouponBox({
  onFullDiscount,
}: {
  onFullDiscount: () => void
}) {
  const [value, setValue] = useState('')
  const [applied, setApplied] = useState(false)
  const [error, setCouponError] = useState('')

  function handleApply() {
    const code = value.trim().toUpperCase()
    const coupon = VALID_COUPONS[code]
    if (!coupon) { setCouponError('Cupom inválido. Verifique o código e tente novamente.'); return }
    setCouponError('')
    setApplied(true)
    if (coupon.discount === 100) onFullDiscount()
  }

  if (applied) return (
    <div style={{ background: 'var(--success-soft)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, border: '1px solid var(--success)' }}>
      <Icon name="tag" size={20} color="var(--success)" />
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--success)', margin: 0 }}>Cupom aplicado! 🎉</p>
        <p style={{ fontSize: 12, color: 'var(--success)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{VALID_COUPONS[value.trim().toUpperCase()]?.label}</p>
      </div>
    </div>
  )

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-strong)', margin: '0 0 8px' }}>
        🏷️ Cupom de desconto
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={value}
          onChange={e => { setValue(e.target.value.toUpperCase()); setCouponError('') }}
          placeholder="Digite seu cupom"
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 12,
            border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-subtle)'}`,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-strong)',
            background: '#fff',
            outline: 'none',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
        />
        <button
          onClick={handleApply}
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--gradient-brand)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-accent)',
          }}
        >
          Aplicar
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-body)', margin: '6px 0 0' }}>{error}</p>
      )}
    </div>
  )
}

// ── Conteúdo principal ────────────────────────────────────────────────────────
function PagamentoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const product = getProductInfo(params)
  const { user } = useApp()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [couponFree, setCouponFree] = useState(false)

  // Crédito disponível da conta (não aplica crédito para comprar crédito)
  const credit = product.type === 'credit' ? 0 : (user?.account_credit_brl ?? 0)
  const originalAmount = parseFloat(product.amount)
  const creditUsed = Math.min(credit, originalAmount)
  const finalAmount = Math.max(0.50, originalAmount - creditUsed).toFixed(2)
  const isFreeWithCredit = product.type !== 'credit' && credit >= originalAmount

  useEffect(() => {
    if (isFreeWithCredit) { setLoading(false); return }
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: product.type,
        plan: product.plan,
        billing: product.billing,
        amount: finalAmount,
        userId: product.uid,
        senderName: product.senderName,
        message: product.message,
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

  function handleCouponActivate() {
    setSuccess(true)
  }

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

          {/* Resumo do pedido */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', marginBottom: creditUsed > 0 ? 0 : 20, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 36 }}>{product.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: 0 }}>{product.name}</p>
              <p style={{ fontSize: 13, color: (couponFree || isFreeWithCredit) ? 'var(--success)' : 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, fontWeight: (couponFree || isFreeWithCredit) ? 700 : 400 }}>
                {(couponFree || isFreeWithCredit) ? 'Grátis 🎉' : product.price}
              </p>
            </div>
          </div>

          {/* Linha de crédito aplicado */}
          {creditUsed > 0 && !couponFree && (
            <div style={{ background: '#F0FDF4', borderRadius: '0 0 14px 14px', padding: '10px 18px', marginBottom: 20, border: '1px solid #86EFAC', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#166534', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6 }}>
                💰 Crédito em conta
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', fontFamily: 'var(--font-body)' }}>
                - R$ {creditUsed.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}

          {/* Campo de cupom — apenas para upgrade premium */}
          {product.type === 'upgrade' && !isFreeWithCredit && (
            <CouponBox onFullDiscount={() => setCouponFree(true)} />
          )}

          {/* CTA: crédito cobre tudo ou cupom 100% */}
          {(couponFree || isFreeWithCredit) ? (
            <button
              onClick={handleCouponActivate}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 14,
                border: 'none',
                background: 'var(--gradient-brand)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-accent)',
              }}
            >
              ✨ Ativar plano gratuitamente
            </button>
          ) : (
<>
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
                  <CheckoutForm
                    productName={product.name}
                    returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/pagamento/sucesso?type=${product.type}&uid=${product.uid}`}
                    onSuccess={() => setSuccess(true)}
                  />
                </Elements>
              )}
            </>
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
