'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { getStorageUsedBytes } from '@/lib/supabase/queries'

// ── Preços ────────────────────────────────────────────────────────────────────
// R2: R$0,086/GB/mês · Stripe: 3,99% + R$0,39 · Lucro: 30%
// Preço anual = (12 meses × custo_r2 + 0,39) ÷ (1 – 0,30 – 0,0399)
// Cobrança: 11 meses (1 mês grátis incluído)
const R2 = 0.086
const MARGIN = 0.6601  // 1 – 30% lucro – 3,99% Stripe

const calcAnnualPrice = (gb: number) =>
  Math.ceil(((12 * gb * R2 + 0.39) / MARGIN) / 0.5) * 0.5

const calcMonthlyEquiv = (annualPrice: number) =>
  Math.ceil((annualPrice / 11) / 0.5) * 0.5

const PLANS = [
  { id: 'free',     name: 'Grátis',   storage: 1,   price: 0,                    emoji: '🌱', color: '#6B53AE', bg: '#F5F3FF' },
  { id: 'basico',   name: 'Básico',   storage: 5,   price: calcAnnualPrice(5),   emoji: '📷', color: '#0284C7', bg: '#E0F2FE' },
  { id: 'familia',  name: 'Família',  storage: 15,  price: calcAnnualPrice(15),  emoji: '👨‍👩‍👧', color: '#059669', bg: '#D1FAE5' },
  { id: 'memorias', name: 'Memórias', storage: 30,  price: calcAnnualPrice(30),  emoji: '🎞️', color: '#D97706', bg: '#FEF3C7' },
  { id: 'premium',  name: 'Premium',  storage: 60,  price: calcAnnualPrice(60),  emoji: '💜', color: '#7C3AED', bg: '#EDE9FE', highlight: true },
  { id: 'pro',      name: 'Pro',      storage: 100, price: calcAnnualPrice(100), emoji: '🚀', color: '#BE185D', bg: '#FCE7F3' },
]

function fmtPrice(p: number) {
  return p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StorageBar({ usedBytes, limitGB }: { usedBytes: number; limitGB: number }) {
  const limitBytes = limitGB * 1024 * 1024 * 1024
  const pct = Math.min((usedBytes / limitBytes) * 100, 100)

  const usedMB = usedBytes / (1024 * 1024)
  const usedLabel = usedMB >= 1024
    ? `${(usedMB / 1024).toFixed(2)} GB`
    : `${usedMB.toFixed(1)} MB`

  const barColor = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#6B53AE'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#6B6A8A', fontWeight: 500 }}>{usedLabel} usados</span>
        <span style={{ fontSize: 12, color: '#6B6A8A', fontWeight: 500 }}>{limitGB} GB total</span>
      </div>
      <div style={{ height: 8, background: '#E7E5F0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct || 0}%`, background: barColor, borderRadius: 99, transition: 'width .6s ease' }} />
      </div>
      {pct > 0 && (
        <p style={{ fontSize: 11, color: barColor, margin: '4px 0 0', textAlign: 'right', fontWeight: 500 }}>
          {pct.toFixed(1)}% usado
        </p>
      )}
    </div>
  )
}

function CreditSection({
  credit,
  userId,
  onCreditAdded,
  router,
}: {
  credit: number
  userId: string
  onCreditAdded: (newTotal: number) => void
  router: ReturnType<typeof useRouter>
}) {
  const [giftCode, setGiftCode] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemMsg, setRedeemMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showTopup, setShowTopup] = useState(false)

  async function handleRedeem() {
    const code = giftCode.trim()
    if (!code) return
    setRedeemLoading(true)
    setRedeemMsg(null)
    try {
      const res = await fetch('/api/gift-card/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setRedeemMsg({ type: 'err', text: data.error ?? 'Código inválido ou já utilizado.' })
        return
      }
      setRedeemMsg({ type: 'ok', text: `R$ ${(data.amount as number).toFixed(2).replace('.', ',')} adicionados ao seu saldo!` })
      onCreditAdded(data.newTotal)
      setGiftCode('')
    } catch {
      setRedeemMsg({ type: 'err', text: 'Erro ao conectar. Tente novamente.' })
    } finally {
      setRedeemLoading(false)
    }
  }

  return (
    <div style={{ margin: '20px 20px 0' }}>
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', margin: '0 0 10px' }}>
        Créditos
      </h3>

      {/* Saldo */}
      <div style={{
        background: credit > 0 ? 'linear-gradient(135deg,#166534,#15803D)' : 'linear-gradient(135deg,#4C1D95,#6B53AE)',
        borderRadius: 18, padding: '18px 20px', marginBottom: 12,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '0 0 2px', fontWeight: 500 }}>Saldo disponível</p>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', margin: '0 0 4px', letterSpacing: -0.5 }}>
          {credit > 0 ? `R$ ${credit.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>
          {credit > 0
            ? 'Descontado automaticamente na próxima assinatura.'
            : 'Adicione créditos ou resgate um gift card.'}
        </p>
      </div>

      {/* Gift card */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #E7E5F0', marginBottom: 10 }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: '#2E2C4A', margin: '0 0 10px' }}>
          🎁 Resgatar gift card
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={giftCode}
            onChange={e => { setGiftCode(e.target.value.toUpperCase()); setRedeemMsg(null) }}
            placeholder="Código do gift card"
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 10,
              border: '1.5px solid #E7E5F0', fontSize: 13,
              fontFamily: 'monospace', letterSpacing: 1.5,
              color: '#2E2C4A', outline: 'none', background: '#FAFAFA',
            }}
            onKeyDown={e => e.key === 'Enter' && handleRedeem()}
          />
          <button
            onClick={handleRedeem}
            disabled={redeemLoading || !giftCode.trim()}
            style={{
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: redeemLoading || !giftCode.trim() ? '#E7E5F0' : '#6B53AE',
              color: redeemLoading || !giftCode.trim() ? '#8B89B0' : '#fff',
              fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13,
              cursor: redeemLoading || !giftCode.trim() ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {redeemLoading ? '...' : 'Resgatar'}
          </button>
        </div>
        {redeemMsg && (
          <p style={{ fontSize: 12, color: redeemMsg.type === 'ok' ? '#166534' : '#DC2626', margin: '8px 0 0', fontWeight: 600 }}>
            {redeemMsg.type === 'ok' ? '✓ ' : '✕ '}{redeemMsg.text}
          </p>
        )}
      </div>

      {/* Comprar créditos */}
      {showTopup ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #E7E5F0' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: '#2E2C4A', margin: '0 0 10px' }}>
            Escolha o valor a adicionar
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[10, 30, 50, 100].map(amt => (
              <button
                key={amt}
                onClick={() => router.push(`/pagamento?type=credit&amount=${amt}&uid=${userId}`)}
                style={{
                  padding: '14px', borderRadius: 12, border: '1.5px solid #DDD6FE',
                  background: '#F5F3FF', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#6B53AE',
                }}
              >
                R$ {amt},00
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowTopup(false)}
            style={{
              width: '100%', padding: '10px', borderRadius: 10,
              border: 'none', background: 'transparent',
              color: '#8B89B0', fontSize: 13, cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowTopup(true)}
          style={{
            width: '100%', padding: '13px', borderRadius: 14,
            border: '1.5px solid #6B53AE', background: 'transparent', cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#6B53AE',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          + Comprar créditos
        </button>
      )}
    </div>
  )
}

export default function PlanosPage() {
  const router = useRouter()
  const { user, baby, setUser } = useApp()
  const [usedBytes, setUsedBytes] = useState(0)
  const [loadingStorage, setLoadingStorage] = useState(true)
  const [downgradeModal, setDowngradeModal] = useState<{ plan: typeof PLANS[0]; credit: number } | null>(null)
  const [processingDowngrade, setProcessingDowngrade] = useState(false)

  const storagePlan = user?.storage_plan ?? 'free'
  const limitGB = user?.storage_limit_gb ?? 1
  const activePlan = PLANS.find(p => p.id === storagePlan) ?? PLANS[0]
  const activeIdx = PLANS.findIndex(p => p.id === storagePlan)

  const usedMB = usedBytes / (1024 * 1024)
  const limitMB = limitGB * 1024
  const pctUsed = (usedMB / limitMB) * 100

  useEffect(() => {
    if (!baby?.id) { setLoadingStorage(false); return }
    getStorageUsedBytes(baby.id)
      .then(b => setUsedBytes(b))
      .catch(() => {})
      .finally(() => setLoadingStorage(false))
  }, [baby?.id])

  function calcCredit(targetPlan: typeof PLANS[0]): number {
    if (!user?.plan_expires_at || activePlan.price === 0) return 0
    const now = new Date()
    const expires = new Date(user.plan_expires_at)
    const daysRemaining = Math.max(0, (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const credit = (daysRemaining / 365) * activePlan.price
    return Math.round(credit * 100) / 100
  }

  function handlePlanClick(targetPlan: typeof PLANS[0]) {
    if (targetPlan.id === storagePlan) return
    const targetIdx = PLANS.findIndex(p => p.id === targetPlan.id)
    const isDowngrade = targetIdx < activeIdx && activePlan.price > 0

    if (isDowngrade) {
      const credit = calcCredit(targetPlan)
      setDowngradeModal({ plan: targetPlan, credit })
    } else {
      if (targetPlan.id === 'free') return
      router.push(`/pagamento?type=upgrade&plan=${targetPlan.id}&billing=yearly&uid=${user?.id ?? ''}&price=${targetPlan.price.toFixed(2)}`)
    }
  }

  async function confirmDowngrade() {
    if (!downgradeModal) return
    setProcessingDowngrade(true)
    try {
      const res = await fetch('/api/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan: downgradeModal.plan.id, creditBrl: downgradeModal.credit }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      // Atualiza contexto local
      if (user) setUser({
        ...user,
        storage_plan: downgradeModal.plan.id,
        storage_limit_gb: downgradeModal.plan.storage,
        plan_expires_at: undefined,
        account_credit_brl: json.totalCredit,
      })
      setDowngradeModal(null)
    } catch (e) {
      console.error(e)
    } finally {
      setProcessingDowngrade(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F7', fontFamily: 'Inter, sans-serif', paddingBottom: 48 }}>
      <StatusBar />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 0' }}>
        <button
          onClick={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 12, border: '1.5px solid #E7E5F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Icon name="chevron-left" size={20} color="#6B53AE" />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: '#2E2C4A', margin: 0 }}>Planos</h1>
          <p style={{ fontSize: 12, color: '#8B89B0', margin: 0 }}>Escolha o armazenamento ideal</p>
        </div>
      </div>

      {/* Uso atual */}
      <div style={{ margin: '16px 20px 0', background: '#fff', borderRadius: 18, padding: '16px 18px', border: '1.5px solid #E7E5F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="hard-drive" size={16} color="#6B53AE" />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', margin: 0 }}>Armazenamento</p>
            <p style={{ fontSize: 11, color: '#8B89B0', margin: 0 }}>
              Plano atual: <strong>{activePlan.name} — {limitGB} GB</strong>
            </p>
          </div>
        </div>

        {loadingStorage ? (
          <div style={{ height: 8, background: '#E7E5F0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '30%', background: 'linear-gradient(90deg,#E7E5F0,#D5D3E8,#E7E5F0)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          </div>
        ) : (
          <StorageBar usedBytes={usedBytes} limitGB={limitGB} />
        )}
      </div>

      {/* Aviso quando >80% cheio */}
      {!loadingStorage && pctUsed >= 80 && (
        <div style={{
          margin: '12px 20px 0',
          background: pctUsed >= 95 ? '#FEF2F2' : '#FFFBEB',
          borderRadius: 14,
          padding: '12px 14px',
          border: `1px solid ${pctUsed >= 95 ? '#FCA5A5' : '#FCD34D'}`,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ flexShrink: 0, marginTop: 1 }}>
            <Icon name="alert-triangle" size={16} color={pctUsed >= 95 ? '#EF4444' : '#D97706'} />
          </div>
          <div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, color: pctUsed >= 95 ? '#991B1B' : '#92400E', margin: '0 0 2px' }}>
              {pctUsed >= 95 ? 'Armazenamento quase cheio!' : 'Espaço acabando'}
            </p>
            <p style={{ fontSize: 12, color: pctUsed >= 95 ? '#B91C1C' : '#B45309', margin: 0, lineHeight: 1.4 }}>
              {pctUsed >= 95
                ? 'Faça upgrade agora para continuar salvando memórias.'
                : 'Você usou mais de 80% do espaço. Considere fazer um upgrade.'}
            </p>
          </div>
        </div>
      )}

      {/* O que está incluído em todos os planos */}
      <div style={{ margin: '16px 20px 0', background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)', borderRadius: 16, padding: '14px 16px', border: '1px solid #DDD6FE' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: '#4C1D95', margin: '0 0 8px' }}>Todos os planos incluem</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          {['Fotos e vídeos', 'Gravação de áudio', 'Histórias de texto', 'Conquistas e XP', 'Compartilhamento família', 'Árvore da Vida'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={12} color="#7C3AED" strokeWidth={3} />
              <span style={{ fontSize: 12, color: '#4C1D95' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Seção de Créditos ──────────────────────────────────────── */}
      <CreditSection
        credit={user?.account_credit_brl ?? 0}
        userId={user?.id ?? ''}
        onCreditAdded={(newTotal) => {
          if (user) setUser({ ...user, account_credit_brl: newTotal })
        }}
        router={router}
      />

      {/* Cards de plano */}
      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', margin: 0 }}>Escolha seu armazenamento</h3>
          <p style={{ fontSize: 11, color: '#8B89B0', margin: '2px 0 0' }}>Assinatura anual · 1 mês grátis incluído em todos os planos</p>
        </div>

        {PLANS.map((p) => {
          const isActive = p.id === storagePlan
          const isFree = p.id === 'free'
          const isHighlight = 'highlight' in p && p.highlight
          const hasBadge = isActive || (isHighlight && !isActive)

          return (
            <div
              key={p.id}
              style={{
                background: isHighlight ? 'linear-gradient(135deg,#6B53AE,#4E4490)' : '#fff',
                borderRadius: 18,
                border: isActive
                  ? `2px solid ${p.color}`
                  : isHighlight ? '2px solid transparent' : '1.5px solid #E7E5F0',
                padding: '14px 16px',
                boxShadow: isHighlight ? '0 4px 20px rgba(107,83,174,0.3)' : '0 1px 6px rgba(0,0,0,0.05)',
              }}
            >
              {/* Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (hasBadge || !isFree) ? 8 : 0 }}>
                {hasBadge ? (
                  <span style={{
                    background: isActive
                      ? (isHighlight ? 'rgba(255,255,255,0.2)' : p.bg)
                      : 'rgba(255,255,255,0.2)',
                    borderRadius: 99, padding: '3px 10px',
                    fontSize: 10, fontWeight: 700,
                    color: isActive
                      ? (isHighlight ? '#fff' : p.color)
                      : '#fff',
                    border: `1px solid ${isActive
                      ? (isHighlight ? 'rgba(255,255,255,0.3)' : p.color + '33')
                      : 'rgba(255,255,255,0.35)'}`,
                  }}>
                    {isActive ? 'Plano atual' : 'Mais popular'}
                  </span>
                ) : <span />}
                {!isFree && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: isHighlight ? '#FFD166' : p.color,
                    background: isHighlight ? 'rgba(255,209,102,0.18)' : p.bg,
                    padding: '3px 10px', borderRadius: 99,
                    border: `1px solid ${isHighlight ? 'rgba(255,209,102,0.35)' : p.color + '33'}`,
                  }}>
                    1 mês grátis
                  </span>
                )}
              </div>

              {/* Linha principal: ícone | info | preço+botão */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: isHighlight ? 'rgba(255,255,255,0.15)' : p.bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{p.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isHighlight ? 'rgba(255,255,255,0.85)' : p.color, marginTop: 2 }}>{p.storage} GB</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: isHighlight ? '#fff' : '#2E2C4A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: 11, color: isHighlight ? 'rgba(255,255,255,0.7)' : '#8B89B0', margin: '2px 0 0' }}>
                    {p.storage} GB
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 13, color: isHighlight ? '#fff' : p.color, margin: '0 0 2px', whiteSpace: 'nowrap' }}>
                    {isFree ? 'Grátis' : `${fmtPrice(p.price)}/ano`}
                  </p>
                  {!isFree && (
                    <p style={{ fontSize: 10, color: isHighlight ? 'rgba(255,255,255,0.65)' : '#8B89B0', margin: '0 0 6px', whiteSpace: 'nowrap' }}>
                      ≈ {fmtPrice(calcMonthlyEquiv(p.price))}/mês
                    </p>
                  )}
                  {!isFree && (
                    <button
                      onClick={() => !isActive && handlePlanClick(p)}
                      disabled={isActive}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: isActive ? 'default' : 'pointer',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        background: isActive
                          ? (isHighlight ? 'rgba(255,255,255,0.2)' : p.bg)
                          : isHighlight ? '#fff' : 'linear-gradient(135deg,#B79BD8,#6B53AE)',
                        color: isActive
                          ? (isHighlight ? 'rgba(255,255,255,0.6)' : p.color)
                          : isHighlight ? '#6B53AE' : '#fff',
                      }}
                    >
                      {isActive ? 'Ativo' : PLANS.findIndex(x => x.id === p.id) < activeIdx ? 'Fazer downgrade' : 'Assinar'}
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de progresso só no plano ativo */}
              {isActive && !loadingStorage && (
                <div style={{ marginTop: 12 }}>
                  <StorageBar usedBytes={usedBytes} limitGB={p.storage} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de confirmação de downgrade */}
      {downgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 360 }}>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#2E2C4A', margin: '0 0 8px' }}>
              Confirmar downgrade
            </p>
            <p style={{ fontSize: 13, color: '#6B6A8A', lineHeight: 1.6, margin: '0 0 16px' }}>
              Você irá mudar do plano <strong>{activePlan.name}</strong> para <strong>{downgradeModal.plan.name}</strong>.
            </p>

            {downgradeModal.credit > 0 ? (
              <div style={{ background: '#F0FDF4', borderRadius: 12, padding: '12px 14px', marginBottom: 16, border: '1px solid #86EFAC' }}>
                <p style={{ fontSize: 13, color: '#166534', margin: 0, fontWeight: 600 }}>
                  💰 Crédito gerado: R$ {downgradeModal.credit.toFixed(2).replace('.', ',')}
                </p>
                <p style={{ fontSize: 11, color: '#15803D', margin: '4px 0 0' }}>
                  Dias restantes do plano atual convertidos em crédito para a próxima assinatura.
                </p>
              </div>
            ) : (
              <div style={{ background: '#FFF7ED', borderRadius: 12, padding: '12px 14px', marginBottom: 16, border: '1px solid #FCD34D' }}>
                <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>
                  Nenhum crédito disponível — o plano atual não tem dias restantes para calcular.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDowngradeModal(null)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E7E5F0', background: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#6B6A8A', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDowngrade}
                disabled={processingDowngrade}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#6B53AE', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', cursor: processingDowngrade ? 'not-allowed' : 'pointer', opacity: processingDowngrade ? 0.7 : 1 }}
              >
                {processingDowngrade ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
