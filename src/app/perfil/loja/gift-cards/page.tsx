'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import AppShell from '@/components/layout/AppShell';
import { MOCK_GIFT_CARD } from '@/lib/mock-data';

const AMOUNTS = ['29,90', '49,90', '99,90'];

export default function GiftCardsPage() {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState('49,90');

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Gift Cards" onBack={() => router.back()} />

        <div style={{ padding: '0 16px 32px' }}>
          {/* Gift card visual */}
          <div style={{
            background: 'var(--gradient-brand)',
            borderRadius: 24,
            padding: 24,
            marginBottom: 16,
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{ marginBottom: 20 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                color: '#fff',
              }}>
                💜 memora bebê
              </span>
            </div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 32,
              color: '#fff',
              margin: '0 0 6px',
            }}>
              R$ 49,90
            </p>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              fontFamily: 'var(--font-body)',
            }}>
              De: Vó Maria
            </p>
          </div>

          {/* Message card */}
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 18,
            padding: '16px 18px',
            marginBottom: 20,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              margin: '0 0 8px',
              fontFamily: 'var(--font-body)',
            }}>
              Mensagem de Vó Maria
            </p>
            <p style={{
              fontSize: 15,
              color: 'var(--text-body)',
              margin: 0,
              fontFamily: 'var(--font-body)',
              lineHeight: 1.55,
            }}>
              {MOCK_GIFT_CARD?.message ?? 'Com muito amor, aqui está um presentinho especial para você registrar cada momento lindo do nosso bebê! 💜'}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push('/perfil/loja/gift-cards/resgatar')}
            >
              Resgatar cartão
            </Button>
            <Button variant="ghost" fullWidth onClick={() => {}}>
              Histórico de gift cards
            </Button>
          </div>

          {/* Buy section */}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--text-strong)',
            margin: '0 0 12px',
          }}>
            Comprar Gift Card
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {AMOUNTS.map((amt) => (
              <div
                key={amt}
                onClick={() => setSelectedAmount(amt)}
                style={{
                  background: 'var(--surface-card)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: selectedAmount === amt
                    ? '2px solid var(--accent)'
                    : '2px solid var(--border-subtle)',
                  cursor: 'pointer',
                  boxShadow: selectedAmount === amt ? 'var(--shadow-accent)' : 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 17,
                  color: 'var(--text-strong)',
                }}>
                  R$ {amt}
                </span>
                {selectedAmount === amt && (
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 12,
                  }}>
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push(`/pagamento?type=giftcard&amount=${selectedAmount}`)}
          >
            Comprar agora
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
