'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'
import { MOCK_FAMILY } from '@/lib/mock-data'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const gradients = [
  'linear-gradient(135deg,#B79BD8,#6B53AE)',
  'linear-gradient(135deg,#F9A8D4,#C76FB0)',
  'linear-gradient(135deg,#86EFAC,#4F9E7C)',
]

const actions = [
  { label: 'Convidar', emoji: '📩', key: 'invite' },
  { label: 'QR Code', emoji: '📱', key: 'qr' },
  { label: 'Link', emoji: '🔗', key: 'link' },
]

export default function FamiliaPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', fontFamily: 'var(--font-body)' }}>
      <StatusBar />
      <ScreenHeader title="Família" onBack={() => router.back()} />

      {/* Invite Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '20px 20px 24px' }}>
        {actions.map((action) => (
          <div key={action.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <button
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                background: 'var(--violet-100)',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {action.emoji}
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-body)', fontWeight: 500 }}>{action.label}</span>
          </div>
        ))}
      </div>

      {/* Family List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
          Membros
        </div>
        {MOCK_FAMILY.map((member, i) => (
          <div
            key={member.id}
            style={{
              background: 'var(--surface-card)',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: gradients[i % gradients.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {getInitials(member.name)}
            </div>

            {/* Name + status */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-strong)' }}>{member.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: member.status === 'accepted' ? 'var(--success-soft)' : 'var(--warning-soft)',
                    color: member.status === 'accepted' ? 'var(--success)' : 'var(--warning)',
                  }}
                >
                  {member.status === 'accepted' ? 'Aceitou' : 'Pendente'}
                </span>
              </div>
            </div>

            {/* Heart */}
            <Icon name="heart" size={18} color="var(--rose-500)" />
          </div>
        ))}
      </div>

      {/* Feed CTA */}
      <div style={{ padding: '20px 20px 32px' }}>
        <Link href="/perfil/familia/feed" style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--violet-50) 0%, var(--violet-100) 100%)',
              borderRadius: 18,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="rss" size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-strong)' }}>Feed da Família</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Compartilhe momentos especiais</div>
            </div>
            <Icon name="chevron-right" size={18} color="var(--text-muted)" />
          </div>
        </Link>
      </div>
    </div>
  )
}
