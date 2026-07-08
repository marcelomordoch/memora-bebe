'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppContext';
import { redeemGiftCard } from '@/lib/supabase/queries';

// Auto-formats input into XXXX-XXXX-XXXX-XXXX
function formatCode(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const parts = clean.match(/.{1,4}/g) ?? [];
  return parts.slice(0, 4).join('-');
}

function ResgatarContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useApp();
  const [code, setCode] = useState(() => formatCode(params.get('code') ?? ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redeemedAmount, setRedeemedAmount] = useState<number | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setCode(formatCode(e.target.value));
  };

  const handleResgatar = async () => {
    if (!code.trim() || !user) return;
    setLoading(true);
    setError('');
    try {
      const result = await redeemGiftCard(code, user.id);
      setRedeemedAmount(result.amount);
    } catch (err: any) {
      setError(err.message ?? 'Código inválido ou já utilizado');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Resgatar Gift Card" onBack={() => router.back()} />

        <div style={{ padding: '24px 16px 32px' }}>
          {redeemedAmount !== null ? (
            /* ── Success state ── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--success-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Icon name="check" size={36} color="var(--success)" strokeWidth={2.5} />
              </div>
              <p style={{
                fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 22,
                color: '#2E2C4A', margin: '0 0 10px', textAlign: 'center',
              }}>
                Gift card resgatado! 🎉
              </p>
              <p style={{
                fontSize: 15, color: '#8B89B0', margin: '0 0 32px',
                textAlign: 'center', fontFamily: 'Inter,sans-serif',
              }}>
                {formatAmount(redeemedAmount)} adicionados ao seu saldo
              </p>
              <Button variant="primary" fullWidth onClick={() => router.push('/perfil/loja/gift-cards')}>
                Ir para Gift Cards
              </Button>
            </div>
          ) : (
            /* ── Input state ── */
            <>
              <p style={{
                fontSize: 16, color: 'var(--text-body)',
                fontFamily: 'Inter,sans-serif', marginBottom: 8, textAlign: 'center',
              }}>
                Digite o código do gift card
              </p>
              <p style={{
                fontSize: 13, color: '#8B89B0',
                fontFamily: 'Inter,sans-serif', marginBottom: 24, textAlign: 'center',
              }}>
                Formato: XXXX-XXXX-XXXX-XXXX
              </p>

              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={19}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: error ? '2px solid var(--danger)' : '2px solid var(--border-strong)',
                    fontFamily: 'Inter,sans-serif',
                    fontWeight: 600,
                    fontSize: 16,
                    color: '#2E2C4A',
                    letterSpacing: '0.12em',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    background: 'var(--surface-card)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: 'var(--rose-100)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}>
                  <Icon name="alert-circle" size={18} color="var(--danger)" />
                  <p style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'Inter,sans-serif', margin: 0 }}>
                    {error}
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                loading={loading}
                disabled={code.replace(/-/g, '').length < 16 || !user}
                onClick={handleResgatar}
              >
                Resgatar
              </Button>

              {!user && (
                <p style={{ textAlign: 'center', fontSize: 13, color: '#8B89B0', marginTop: 12, fontFamily: 'Inter,sans-serif' }}>
                  Faça login para resgatar um gift card.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function ResgatarGiftCardPage() {
  return (
    <Suspense fallback={
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ width: 28, height: 28, border: '3px solid #E7E5F0', borderTopColor: '#6B53AE', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ResgatarContent />
    </Suspense>
  );
}
