'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'

const links = [
  {
    label: 'Árvore da Vida',
    subtitle: 'Veja sua jornada visual',
    href: '/conquistas/arvore',
    icon: 'leaf',
    bgColor: 'var(--violet-100)',
  },
  {
    label: 'Família',
    subtitle: 'Gerencie seus familiares',
    href: '/perfil/familia',
    icon: 'users',
    bgColor: 'var(--rose-100)',
  },
  {
    label: 'Mensagens para o Futuro',
    subtitle: 'Cartas para quando crescer',
    href: '/perfil/mensagens',
    icon: 'clock',
    bgColor: 'var(--success-soft)',
  },
  {
    label: 'Gift Cards & Loja',
    subtitle: 'Presentes e benefícios',
    href: '/perfil/loja',
    icon: 'gift',
    bgColor: 'var(--warning-soft)',
  },
]

export default function PerfilPage() {
  const { baby } = useApp()
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', fontFamily: 'var(--font-body)' }}>
      <StatusBar />

      {/* Avatar Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 8px' }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              border: '3px solid #fff',
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            💜
          </div>
          {/* Camera badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              background: 'var(--accent)',
              border: '3px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="camera" size={14} color="#fff" strokeWidth={2.5} />
          </div>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)', margin: '0 0 4px' }}>
          {baby?.name ?? 'Sofia'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>24ª semana de gestação</p>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          margin: '16px 20px',
          background: 'var(--surface-card)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
        }}
      >
        {[
          { label: 'Marcos', value: '8' },
          { label: 'XP', value: '340' },
          { label: 'Família', value: '3' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: '14px 0',
              textAlign: 'center',
              borderRight: i < 2 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--accent)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* About Card */}
      {baby?.about && (
        <div
          style={{
            margin: '0 20px 16px',
            background: 'linear-gradient(135deg, var(--violet-50) 0%, var(--violet-100) 100%)',
            borderRadius: 18,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Sobre
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-body)', margin: 0, lineHeight: 1.6 }}>{baby.about}</p>
        </div>
      )}

      {/* Link List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: 'var(--surface-card)',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: link.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={link.icon} size={20} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-strong)' }}>{link.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{link.subtitle}</div>
              </div>
              <Icon name="chevron-right" size={18} color="var(--text-muted)" />
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '20px 20px 32px' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            padding: '14px',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 14,
            background: 'var(--surface-card)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 15,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="log-out" size={18} color="var(--text-muted)" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
