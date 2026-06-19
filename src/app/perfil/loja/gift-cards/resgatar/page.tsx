'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import AppShell from '@/components/layout/AppShell';

export default function ResgatarGiftCardPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResgatar = async () => {
    if (!code.trim()) return;
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Resgatar Gift Card" onBack={() => router.back()} />

        <div style={{ padding: '24px 16px 32px' }}>
          {success ? (
            /* Success state */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--success-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Icon name="check" size={36} color="var(--success)" strokeWidth={2.5} />
              </div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 22,
                color: 'var(--text-strong)',
                margin: '0 0 10px',
                textAlign: 'center',
              }}>
                Gift card resgatado! 🎉
              </p>
              <p style={{
                fontSize: 15,
                color: 'var(--text-muted)',
                margin: '0 0 32px',
                textAlign: 'center',
                fontFamily: 'var(--font-body)',
              }}>
                R$ 49,90 adicionados ao seu saldo
              </p>
              <Button variant="primary" fullWidth onClick={() => router.push('/perfil/loja')}>
                Ir para a Loja
              </Button>
            </div>
          ) : (
            /* Input state */
            <>
              <p style={{
                fontSize: 16,
                color: 'var(--text-body)',
                fontFamily: 'var(--font-body)',
                marginBottom: 24,
                textAlign: 'center',
              }}>
                Digite o código do gift card
              </p>

              <div style={{ marginBottom: 28 }}>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: MEMORA-XXXX-XXXX"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: '2px solid var(--border-strong)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--text-strong)',
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    background: 'var(--surface-card)',
                    outline: 'none',
                  }}
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!code.trim()}
                onClick={handleResgatar}
              >
                Resgatar
              </Button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
