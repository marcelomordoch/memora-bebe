'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppContext';
import { createClient } from '@/lib/supabase/client';

const PARTNERS = [
  { name: 'Natura',    emoji: '🌿', bg: '#D4EDDA' },
  { name: 'Riachuelo', emoji: '👕', bg: '#D0E4F5' },
  { name: 'Renner',    emoji: '🛍', bg: '#FADBD8' },
  { name: 'Amazon',    emoji: '📦', bg: '#FDEBD0' },
];

export default function LojaPage() {
  const { user } = useApp();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setCredits(data.credits ?? 0);
      });
  }, [user]);

  const formatBalance = (n: number) =>
    `R$ ${n.toFixed(2).replace('.', ',')}`;

  return (
    <AppShell>
      <div style={{ background: '#F4F3F7', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Loja" />

        <div style={{ padding: '0 16px 32px' }}>

          {/* ── Balance card ── */}
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 24,
            boxShadow: 'var(--shadow-md)',
            padding: 20,
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: '#8B89B0', margin: '0 0 4px', fontFamily: 'Inter,sans-serif' }}>
              Seu saldo
            </p>
            <p style={{
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 800,
              fontSize: 34,
              color: '#2E2C4A',
              margin: '0 0 10px',
            }}>
              {credits === null ? '—' : formatBalance(credits)}
            </p>
            <Link
              href="/perfil/loja/gift-cards/resgatar"
              style={{
                fontSize: 13,
                color: '#6B53AE',
                textDecoration: 'none',
                fontFamily: 'Inter,sans-serif',
                fontWeight: 500,
              }}
            >
              Resgatar gift card →
            </Link>
          </div>

          {/* ── Parceiros ── */}
          <h2 style={{
            fontFamily: 'Poppins,sans-serif',
            fontWeight: 700,
            fontSize: 17,
            color: '#2E2C4A',
            margin: '0 0 12px',
          }}>
            Parceiros
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                style={{
                  background: 'var(--surface-card)',
                  borderRadius: 16,
                  boxShadow: 'var(--shadow-sm)',
                  padding: '16px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  opacity: 0.85,
                }}
                title="Em breve"
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: p.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {p.emoji}
                </div>
                <div>
                  <span style={{ fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', display: 'block' }}>
                    {p.name}
                  </span>
                  <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, color: '#8B89B0' }}>
                    Em breve
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── CTA Gift Cards ── */}
          <Link href="/perfil/loja/gift-cards" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
              borderRadius: 18,
              padding: 20,
              cursor: 'pointer',
            }}>
              <p style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', margin: '0 0 6px' }}>
                Ofertas exclusivas para mamães! 🎁
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, fontFamily: 'Inter,sans-serif' }}>
                Presenteie quem você ama com um gift card
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
