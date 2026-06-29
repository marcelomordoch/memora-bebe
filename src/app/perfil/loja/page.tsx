'use client'

import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import AppShell from '@/components/layout/AppShell'
import Icon from '@/components/ui/Icon'

const PARTNERS = [
  { name: 'Natura',    emoji: '🌿', bg: '#D4EDDA', color: '#1A7A3B' },
  { name: 'Riachuelo', emoji: '👕', bg: '#D0E4F5', color: '#1A4E7A' },
  { name: 'Renner',    emoji: '🛍', bg: '#FADBD8', color: '#7A1A1A' },
  { name: 'Amazon',    emoji: '📦', bg: '#FDEBD0', color: '#7A4A1A' },
]

export default function LojaPage() {
  const router = useRouter()

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100dvh', paddingBottom: 32 }}>
        <StatusBar />
        <ScreenHeader title="Loja" onBack={() => router.back()} />

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Em breve */}
          <div style={{ background: 'var(--gradient-brand)', borderRadius: 18, padding: '20px', boxShadow: 'var(--shadow-accent)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', margin: '0 0 6px' }}>
              Loja em breve 🎁
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              Em breve você poderá comprar presentes para mamães e bebês, além de gift cards especiais.
            </p>
          </div>

          {/* Parceiros */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: '0 0 12px' }}>
              Parceiros em destaque
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PARTNERS.map(p => (
                <div key={p.name} style={{ background: '#fff', borderRadius: 14, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {p.emoji}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', margin: 0 }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>Em breve</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Premium */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '16px 18px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => router.push('/planos')}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--violet-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>👑</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: 0 }}>Plano Premium</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>Fotos, vídeos e áudio ilimitados</p>
            </div>
            <Icon name="chevron-right" size={18} color="var(--text-muted)" />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
