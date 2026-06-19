'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppContext';
import { getGiftCards } from '@/lib/supabase/queries';
import type { GiftCard } from '@/types';

const AMOUNTS = [
  { label: '29,90', value: '29.90' },
  { label: '49,90', value: '49.90' },
  { label: '99,90', value: '99.90' },
];

export default function GiftCardsPage() {
  const router = useRouter();
  const { user } = useApp();
  const [selectedAmount, setSelectedAmount] = useState('49.90');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Sender form for purchasing
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getGiftCards(user.id)
      .then(setGiftCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const unredeemedCard = giftCards.find((gc) => !gc.redeemed) ?? null;

  const formatAmount = (n: number) =>
    `R$ ${n.toFixed(2).replace('.', ',')}`;

  const handleBuy = () => {
    const params = new URLSearchParams({
      type: 'giftcard',
      amount: selectedAmount,
    });
    if (user) params.set('uid', user.id);
    if (recipientName.trim()) params.set('senderName', recipientName.trim());
    if (giftMessage.trim()) params.set('message', giftMessage.trim());
    router.push(`/pagamento?${params.toString()}`);
  };

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Gift Cards" onBack={() => router.back()} />

        <div style={{ padding: '0 16px 32px' }}>

          {/* ── Received gift card visual ── */}
          {loading ? (
            <div style={{
              background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 120,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : unredeemedCard ? (
            <div style={{
              background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: '#fff' }}>
                  💜 memora bebê
                </span>
              </div>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 32, color: '#fff', margin: '0 0 6px' }}>
                {formatAmount(unredeemedCard.amount)}
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'Inter,sans-serif' }}>
                De: {unredeemedCard.sender_name}
              </p>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 120,
              gap: 8,
            }}>
              <span style={{ fontSize: 32 }}>🎁</span>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', margin: 0, textAlign: 'center' }}>
                Nenhum gift card recebido ainda
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'Inter,sans-serif', textAlign: 'center' }}>
                Que tal presentear alguém especial?
              </p>
            </div>
          )}

          {/* ── Message from sender ── */}
          {unredeemedCard?.message ? (
            <div style={{
              background: 'var(--surface-card)',
              borderRadius: 18,
              padding: '16px 18px',
              marginBottom: 20,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px', fontFamily: 'Inter,sans-serif' }}>
                Mensagem de {unredeemedCard.sender_name}
              </p>
              <p style={{ fontSize: 15, color: 'var(--text-body)', margin: 0, fontFamily: 'Inter,sans-serif', lineHeight: 1.55 }}>
                {unredeemedCard.message}
              </p>
            </div>
          ) : null}

          {/* ── Action buttons ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push('/perfil/loja/gift-cards/resgatar')}
            >
              Resgatar cartão
            </Button>
          </div>

          {/* ── Buy section ── */}
          <h2 style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700,
            fontSize: 17,
            color: '#2E2C4A',
            margin: '0 0 12px',
          }}>
            Comprar Gift Card
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {AMOUNTS.map(({ label, value }) => (
              <div
                key={value}
                onClick={() => setSelectedAmount(value)}
                style={{
                  background: 'var(--surface-card)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: selectedAmount === value
                    ? '2px solid #6B53AE'
                    : '2px solid var(--border-subtle)',
                  cursor: 'pointer',
                  boxShadow: selectedAmount === value ? '0 0 0 3px rgba(107,83,174,0.12)' : 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 17, color: '#2E2C4A' }}>
                  R$ {label}
                </span>
                {selectedAmount === value && (
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#6B53AE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 12,
                  }}>
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Sender form ── */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', margin: '0 0 10px' }}>
              Para quem é? (opcional)
            </p>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Nome do presenteado"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px 16px',
                borderRadius: 12,
                border: '1.5px solid var(--border-strong)',
                fontFamily: 'Inter,sans-serif',
                fontSize: 15,
                color: '#2E2C4A',
                background: 'var(--surface-card)',
                outline: 'none',
                marginBottom: 10,
              }}
            />
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Deixe uma mensagem carinhosa..."
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px 16px',
                borderRadius: 12,
                border: '1.5px solid var(--border-strong)',
                fontFamily: 'Inter,sans-serif',
                fontSize: 15,
                color: '#2E2C4A',
                background: 'var(--surface-card)',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <Button variant="primary" fullWidth onClick={handleBuy}>
            Comprar Gift Card
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
