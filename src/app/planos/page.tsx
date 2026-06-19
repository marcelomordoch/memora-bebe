'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppContext';

type Billing = 'monthly' | 'annual';

interface Feature {
  label: string;
  included: boolean;
}

const FREE_FEATURES: Feature[] = [
  { label: 'Visualizar memórias da família', included: true },
  { label: 'Curtir e comentar', included: true },
  { label: 'Criar histórias de texto', included: true },
  { label: 'Upload de fotos e vídeos', included: false },
  { label: 'Gravação de áudio', included: false },
  { label: 'Armazenamento ilimitado', included: false },
];

const PREMIUM_FEATURES: Feature[] = [
  { label: 'Visualizar memórias da família', included: true },
  { label: 'Curtir e comentar', included: true },
  { label: 'Criar histórias de texto', included: true },
  { label: 'Upload de fotos e vídeos', included: true },
  { label: 'Gravação de áudio', included: true },
  { label: 'Armazenamento ilimitado', included: true },
];

function FeatureRow({ label, included }: Feature) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      {included ? (
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--success-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="check" size={12} color="var(--success)" strokeWidth={3} />
        </span>
      ) : (
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: '#F0EFF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="x" size={12} color="var(--text-muted)" strokeWidth={2.5} />
        </span>
      )}
      <span style={{
        fontSize: 14,
        color: included ? 'var(--text-body)' : 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function PlanosPage() {
  const router = useRouter();
  const { plan, user } = useApp();
  const [billing, setBilling] = useState<Billing>('monthly');

  const premiumPrice = billing === 'monthly' ? 'R$ 29,90/mês' : 'R$ 249,90/ano';
  const premiumSaving = billing === 'annual' ? ' (economize 30%)' : '';

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Planos" onBack={() => router.back()} />

        <div style={{ padding: '0 16px 40px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24, paddingTop: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👑</div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: 'var(--text-strong)',
              margin: '0 0 8px',
            }}>
              Escolha seu plano
            </h1>
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              margin: 0,
              fontFamily: 'var(--font-body)',
            }}>
              Desbloqueie todo o potencial do Memora Bebê
            </p>
          </div>

          {/* Billing toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-sunken)',
            borderRadius: 12,
            padding: 3,
            marginBottom: 20,
          }}>
            {(['monthly', 'annual'] as Billing[]).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 14,
                  background: billing === b ? 'var(--surface-card)' : 'transparent',
                  color: billing === b ? 'var(--text-strong)' : 'var(--text-muted)',
                  boxShadow: billing === b ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {b === 'monthly' ? 'Mensal' : 'Anual'}
              </button>
            ))}
          </div>

          {/* FREE plan card */}
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 18,
            border: '2px solid var(--border-subtle)',
            padding: 20,
            marginBottom: 16,
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 20,
                    color: 'var(--text-strong)',
                    margin: 0,
                  }}>
                    Free
                  </h2>
                  {plan === 'free' && (
                    <span style={{
                      background: 'var(--success-soft)',
                      color: 'var(--success)',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'var(--font-body)',
                      padding: '3px 8px',
                      borderRadius: 20,
                    }}>
                      Plano atual
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: 18,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--text-body)',
                  margin: 0,
                }}>
                  R$ 0/mês
                </p>
              </div>
              <span style={{
                background: 'var(--success-soft)',
                color: 'var(--success)',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                padding: '5px 12px',
                borderRadius: 20,
              }}>
                Grátis
              </span>
            </div>
            <div>
              {FREE_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </div>
          </div>

          {/* PREMIUM plan card */}
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 18,
            border: '2px solid var(--accent)',
            overflow: 'hidden',
            marginBottom: 24,
            boxShadow: 'var(--shadow-accent)',
          }}>
            {/* Gradient header */}
            <div style={{
              background: 'var(--gradient-brand)',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  color: '#fff',
                  margin: '0 0 2px',
                }}>
                  💜 Premium
                </p>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 17,
                  color: 'rgba(255,255,255,0.9)',
                  margin: 0,
                }}>
                  {premiumPrice}
                  {premiumSaving && (
                    <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>
                      {premiumSaving}
                    </span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{
                  background: 'rgba(255,255,255,0.22)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,0.35)',
                }}>
                  Mais popular
                </span>
                {plan === 'premium' && (
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.35)',
                  }}>
                    Plano atual
                  </span>
                )}
              </div>
            </div>

            <div style={{ padding: 20 }}>
              {PREMIUM_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
              <div style={{ marginTop: 18 }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    const uid = user?.id ?? ''
                    router.push(`/pagamento?type=upgrade&plan=premium&billing=${billing}&uid=${uid}`)
                  }}
                  disabled={plan === 'premium'}
                >
                  {plan === 'premium' ? 'Plano ativo' : 'Assinar Premium'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
