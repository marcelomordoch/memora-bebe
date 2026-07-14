'use client';

import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Icon from '@/components/ui/Icon';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppContext';

// Mesma fórmula de /perfil/planos: custo anual + 30% lucro + Stripe
const R2 = 0.086
const MARGIN = 0.6601

function calcAnnualPrice(gb: number) {
  return Math.ceil(((12 * gb * R2 + 0.39) / MARGIN) / 0.5) * 0.5
}

function calcMonthlyEquiv(annual: number) {
  return Math.ceil((annual / 11) / 0.5) * 0.5
}

function fmtPrice(p: number) {
  return p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const PLANS = [
  { id: 'free',     name: 'Grátis',   storage: 1,   annualPrice: 0,                    emoji: '🌱', color: '#6B53AE', bg: '#F5F3FF', highlight: false },
  { id: 'basico',   name: 'Básico',   storage: 5,   annualPrice: calcAnnualPrice(5),   emoji: '📷', color: '#0284C7', bg: '#E0F2FE', highlight: false },
  { id: 'familia',  name: 'Família',  storage: 15,  annualPrice: calcAnnualPrice(15),  emoji: '👨‍👩‍👧', color: '#059669', bg: '#D1FAE5', highlight: false },
  { id: 'memorias', name: 'Memórias', storage: 30,  annualPrice: calcAnnualPrice(30),  emoji: '🎞️', color: '#D97706', bg: '#FEF3C7', highlight: false },
  { id: 'premium',  name: 'Premium',  storage: 60,  annualPrice: calcAnnualPrice(60),  emoji: '💜', color: '#7C3AED', bg: '#EDE9FE', highlight: true },
  { id: 'pro',      name: 'Pro',      storage: 100, annualPrice: calcAnnualPrice(100), emoji: '🚀', color: '#BE185D', bg: '#FCE7F3', highlight: false },
]

const FEATURES = [
  'Fotos e vídeos', 'Gravação de áudio',
  'Histórias de texto', 'Conquistas e XP',
  'Compartilhamento família', 'Árvore da Vida',
]

export default function PlanosPage() {
  const router = useRouter();
  const { plan: currentPlan, user } = useApp();

  const trialEnds = user?.created_at
    ? new Date(new Date(user.created_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null
  const trialDaysLeft = trialEnds
    ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Planos" onBack={() => router.back()} />

        <div style={{ padding: '0 16px 40px' }}>

          {/* Banner do trial */}
          <div style={{
            marginBottom: 20,
            background: 'linear-gradient(135deg, #6B53AE, #4E4490)',
            borderRadius: 20,
            padding: '22px 20px',
            textAlign: 'center',
            boxShadow: '0 6px 24px rgba(107,83,174,0.35)',
          }}>
            <div style={{ fontSize: 38, marginBottom: 8, lineHeight: 1 }}>🎁</div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
              color: '#fff', margin: '0 0 8px',
            }}>
              1 mês grátis para testar
            </h1>
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.82)', margin: '0 0 14px',
              lineHeight: 1.55, fontFamily: 'var(--font-body)',
            }}>
              Experimente por 30 dias sem pagar nada.{'\n'}
              Depois, assine o plano que crescer com você.
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: 99, padding: '5px 14px',
              fontSize: 12, color: '#fff', fontWeight: 600,
              fontFamily: 'var(--font-body)',
            }}>
              <Icon name="calendar" size={12} color="rgba(255,255,255,0.8)" />
              Assinatura anual · 1 mês grátis incluído
            </span>
          </div>

          {/* Recursos incluídos em todos os planos */}
          <div style={{
            background: 'var(--surface-card)', borderRadius: 16,
            padding: '14px 16px', marginBottom: 16,
            border: '1px solid var(--border-subtle)',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              color: 'var(--accent)', margin: '0 0 10px',
            }}>
              Todos os planos incluem
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px 12px' }}>
              {FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="check" size={12} color="var(--accent)" strokeWidth={3} />
                  <span style={{ fontSize: 12, color: 'var(--text-body)', fontFamily: 'var(--font-body)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cards de plano */}
          {PLANS.map(p => {
            const isActive = p.id === (currentPlan || 'free')
            const isFree = p.id === 'free'
            const monthlyEquiv = isFree ? 0 : calcMonthlyEquiv(p.annualPrice)

            return (
              <div
                key={p.id}
                style={{
                  background: p.highlight
                    ? 'linear-gradient(135deg,#6B53AE,#4E4490)'
                    : 'var(--surface-card)',
                  borderRadius: 18,
                  border: isActive
                    ? `2px solid ${p.color}`
                    : p.highlight ? '2px solid transparent' : '1.5px solid var(--border-subtle)',
                  padding: '14px 16px',
                  marginBottom: 10,
                  boxShadow: p.highlight
                    ? '0 4px 20px rgba(107,83,174,0.3)'
                    : '0 1px 6px rgba(0,0,0,0.04)',
                }}
              >
                {/* Badge row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  {isActive ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: p.highlight ? '#fff' : p.color,
                      background: p.highlight ? 'rgba(255,255,255,0.2)' : p.bg,
                      padding: '3px 10px', borderRadius: 99,
                      border: `1px solid ${p.highlight ? 'rgba(255,255,255,0.3)' : p.color + '33'}`,
                      fontFamily: 'var(--font-body)',
                    }}>
                      Plano atual
                    </span>
                  ) : p.highlight ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 99,
                      border: '1px solid rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)',
                    }}>
                      Mais popular
                    </span>
                  ) : <span />}

                  {!isFree && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: p.highlight ? '#FFD166' : p.color,
                      background: p.highlight ? 'rgba(255,209,102,0.18)' : p.bg,
                      padding: '3px 10px', borderRadius: 99,
                      border: `1px solid ${p.highlight ? 'rgba(255,209,102,0.35)' : p.color + '33'}`,
                      fontFamily: 'var(--font-body)',
                    }}>
                      1 mês grátis
                    </span>
                  )}
                </div>

                {/* Linha principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Ícone */}
                  <div style={{
                    width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                    background: p.highlight ? 'rgba(255,255,255,0.15)' : p.bg,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 21, lineHeight: 1 }}>{p.emoji}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: p.highlight ? 'rgba(255,255,255,0.85)' : p.color, marginTop: 2 }}>
                      {p.storage} GB
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                      color: p.highlight ? '#fff' : 'var(--text-strong)', margin: 0,
                    }}>
                      {p.name}
                    </p>
                    {isFree ? (
                      <p style={{ fontSize: 20, fontWeight: 800, color: p.highlight ? '#fff' : p.color, margin: '3px 0 0', fontFamily: 'var(--font-display)' }}>
                        Grátis
                      </p>
                    ) : (
                      <>
                        <p style={{ fontSize: 17, fontWeight: 800, color: p.highlight ? '#fff' : p.color, margin: '3px 0 0', fontFamily: 'var(--font-display)' }}>
                          {fmtPrice(p.annualPrice)}
                          <span style={{ fontSize: 11, fontWeight: 500, color: p.highlight ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}>/ano</span>
                        </p>
                        <p style={{ fontSize: 11, color: p.highlight ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', margin: '1px 0 0', fontFamily: 'var(--font-body)' }}>
                          ≈ {fmtPrice(monthlyEquiv)}/mês
                        </p>
                      </>
                    )}
                  </div>

                  {/* Botão */}
                  {!isFree && (
                    <button
                      onClick={() => {
                        if (isActive) return
                        router.push(`/pagamento?type=upgrade&plan=${p.id}&billing=yearly&uid=${user?.id ?? ''}&price=${p.annualPrice.toFixed(2)}`)
                      }}
                      disabled={isActive}
                      style={{
                        padding: '10px 16px', borderRadius: 12, border: 'none',
                        cursor: isActive ? 'default' : 'pointer',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                        whiteSpace: 'nowrap', flexShrink: 0,
                        background: isActive
                          ? (p.highlight ? 'rgba(255,255,255,0.2)' : p.bg)
                          : p.highlight ? '#fff' : 'linear-gradient(135deg,#B79BD8,#6B53AE)',
                        color: isActive
                          ? (p.highlight ? 'rgba(255,255,255,0.6)' : p.color)
                          : p.highlight ? '#6B53AE' : '#fff',
                      }}
                    >
                      {isActive ? 'Ativo' : 'Assinar'}
                    </button>
                  )}
                </div>

                {/* Countdown do trial — só no card Grátis */}
                {isFree && user && (
                  <div style={{
                    marginTop: 12, padding: '10px 12px', borderRadius: 10,
                    background: trialDaysLeft > 0 ? '#F5F3FF' : '#FFF7ED',
                    border: `1px solid ${trialDaysLeft > 0 ? '#DDD6FE' : '#FCD34D'}`,
                  }}>
                    {trialDaysLeft > 0 ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#6B53AE', fontFamily: 'var(--font-body)' }}>Período gratuito</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#6B53AE', fontFamily: 'var(--font-body)' }}>
                            {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
                          </span>
                        </div>
                        <div style={{ height: 6, background: '#DDD6FE', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(trialDaysLeft / 30) * 100}%`, background: '#6B53AE', borderRadius: 99 }} />
                        </div>
                        <p style={{ fontSize: 10, color: '#7C3AED', margin: '5px 0 0', lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>
                          Após o período gratuito, escolha um plano para continuar.
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#92400E', margin: 0, lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>
                        Período gratuito encerrado. Assine um plano para continuar salvando memórias.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Rodapé informativo */}
          <p style={{
            textAlign: 'center', fontSize: 12, color: 'var(--text-muted)',
            marginTop: 16, lineHeight: 1.6, fontFamily: 'var(--font-body)',
          }}>
            Assinaturas anuais com renovação automática.{'\n'}
            Cancele a qualquer momento antes da renovação.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
