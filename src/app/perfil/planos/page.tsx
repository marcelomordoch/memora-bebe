'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { getStorageUsedBytes } from '@/lib/supabase/queries'

// ── Preços ────────────────────────────────────────────────────────────────────
// R2: R$0,086/GB/mês · Stripe: 3,99% + R$0,39 · Margem: 15%
// Preço = (custo_r2 + 0,39) ÷ (1 – 0,15 – 0,0399)
const R2 = 0.086
const calcPrice = (gb: number) =>
  Math.ceil(((gb * R2 + 0.39) / 0.8101) / 0.5) * 0.5

const PLANS = [
  { id: 'free',     name: 'Grátis',   storage: 1,   price: 0,             emoji: '🌱', color: '#6B53AE', bg: '#F5F3FF' },
  { id: 'basico',   name: 'Básico',   storage: 5,   price: calcPrice(5),  emoji: '📷', color: '#0284C7', bg: '#E0F2FE' },
  { id: 'familia',  name: 'Família',  storage: 15,  price: calcPrice(15), emoji: '👨‍👩‍👧', color: '#059669', bg: '#D1FAE5' },
  { id: 'memorias', name: 'Memórias', storage: 30,  price: calcPrice(30), emoji: '🎞️', color: '#D97706', bg: '#FEF3C7' },
  { id: 'premium',  name: 'Premium',  storage: 60,  price: calcPrice(60), emoji: '💜', color: '#7C3AED', bg: '#EDE9FE', highlight: true },
  { id: 'pro',      name: 'Pro',      storage: 100, price: calcPrice(100),emoji: '🚀', color: '#BE185D', bg: '#FCE7F3' },
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

export default function PlanosPage() {
  const router = useRouter()
  const { user, baby } = useApp()
  const [usedBytes, setUsedBytes] = useState(0)
  const [loadingStorage, setLoadingStorage] = useState(true)

  // Plano e limite vindos do perfil do usuário
  const storagePlan = user?.storage_plan ?? 'free'
  const limitGB = user?.storage_limit_gb ?? 1
  const activePlan = PLANS.find(p => p.id === storagePlan) ?? PLANS[0]

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

  function handleUpgrade(planId: string, price: number) {
    if (planId === 'free') return
    router.push(
      `/pagamento?type=upgrade&plan=${planId}&uid=${user?.id ?? ''}&price=${price.toFixed(2)}`
    )
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

      {/* Cards de plano */}
      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', margin: 0 }}>Escolha seu armazenamento</h3>

        {PLANS.map((p) => {
          const isActive = p.id === storagePlan
          const isFree = p.id === 'free'
          const isHighlight = 'highlight' in p && p.highlight

          return (
            <div
              key={p.id}
              style={{
                background: isHighlight ? 'linear-gradient(135deg,#6B53AE,#4E4490)' : '#fff',
                borderRadius: 18,
                border: isActive
                  ? `2px solid ${p.color}`
                  : isHighlight ? '2px solid transparent' : '1.5px solid #E7E5F0',
                padding: '16px',
                boxShadow: isHighlight ? '0 4px 20px rgba(107,83,174,0.3)' : '0 1px 6px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: isHighlight ? 'rgba(255,255,255,0.2)' : p.bg,
                  borderRadius: 99, padding: '3px 10px',
                  fontSize: 10, fontWeight: 700,
                  color: isHighlight ? '#fff' : p.color,
                  border: `1px solid ${isHighlight ? 'rgba(255,255,255,0.3)' : p.color + '33'}`,
                }}>
                  Plano atual
                </div>
              )}

              {isHighlight && !isActive && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '3px 10px',
                  fontSize: 10, fontWeight: 700, color: '#fff',
                  border: '1px solid rgba(255,255,255,0.35)',
                }}>
                  Mais popular
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  background: isHighlight ? 'rgba(255,255,255,0.15)' : p.bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{p.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isHighlight ? 'rgba(255,255,255,0.85)' : p.color, marginTop: 2 }}>{p.storage} GB</span>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: isHighlight ? '#fff' : '#2E2C4A', margin: 0 }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: 12, color: isHighlight ? 'rgba(255,255,255,0.75)' : '#8B89B0', margin: '2px 0 0' }}>
                    {p.storage} GB de armazenamento
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: isFree ? 16 : 14, color: isHighlight ? '#fff' : p.color, margin: '0 0 6px' }}>
                    {isFree ? 'Grátis' : `${fmtPrice(p.price)}/mês`}
                  </p>
                  {!isFree && (
                    <button
                      onClick={() => !isActive && handleUpgrade(p.id, p.price)}
                      disabled={isActive}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 10,
                        border: 'none',
                        cursor: isActive ? 'default' : 'pointer',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 700,
                        fontSize: 12,
                        background: isActive
                          ? (isHighlight ? 'rgba(255,255,255,0.2)' : p.bg)
                          : isHighlight ? '#fff' : 'linear-gradient(135deg,#B79BD8,#6B53AE)',
                        color: isActive
                          ? (isHighlight ? 'rgba(255,255,255,0.6)' : p.color)
                          : isHighlight ? '#6B53AE' : '#fff',
                      }}
                    >
                      {isActive ? 'Ativo' : 'Assinar'}
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

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
