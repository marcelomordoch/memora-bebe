'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import AppShell from '@/components/layout/AppShell';

export default function LojaPage() {
  const partners = [
    { label: 'NAT', name: 'Natura', emoji: '🌿', bg: '#D4EDDA', color: '#2D6A4F' },
    { label: 'RCH', name: 'Riachuelo', emoji: '👕', bg: '#D0E4F5', color: '#1A5276' },
    { label: 'RNR', name: 'Renner', emoji: '🛍', bg: '#FADBD8', color: '#922B21' },
    { label: 'AMZ', name: 'Amazon', emoji: '📦', bg: '#FDEBD0', color: '#CA6F1E' },
  ];

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader title="Loja" />

        <div style={{ padding: '0 16px 32px' }}>
          {/* Balance card */}
          <div style={{
            background: 'var(--surface-card)',
            borderRadius: 24,
            boxShadow: 'var(--shadow-md)',
            padding: 20,
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px', fontFamily: 'var(--font-body)' }}>
              Seu saldo
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 34,
              color: 'var(--text-strong)',
              margin: '0 0 10px',
            }}>
              R$ 0,00
            </p>
            <Link
              href="/perfil/loja/gift-cards/resgatar"
              style={{
                fontSize: 13,
                color: 'var(--text-accent)',
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
              }}
            >
              Resgatar gift card →
            </Link>
          </div>

          {/* Parceiros section */}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--text-strong)',
            margin: '0 0 12px',
          }}>
            Parceiros
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 24,
          }}>
            {partners.map((p) => (
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
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: p.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}>
                  {p.emoji}
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'var(--text-strong)',
                }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <Link href="/perfil/loja/gift-cards" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--gradient-brand)',
              borderRadius: 18,
              padding: 20,
              cursor: 'pointer',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 22,
                color: '#fff',
                margin: '0 0 6px',
              }}>
                Ofertas exclusivas para mamães! 🎁
              </p>
              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontFamily: 'var(--font-body)',
              }}>
                Ver todas as ofertas
              </p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
