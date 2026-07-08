'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'

export default function BottomNav() {
  const path = usePathname()
  const { baby } = useApp()

  if (!baby?.id || path.startsWith('/criar-bebe') || path.startsWith('/onboarding')) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      paddingTop: 8,
      zIndex: 100,
    }}>
      <TabItem href="/inicio" icon="home" label="Início" active={path.startsWith('/inicio')} />
      <TabItem href="/memorias" icon="image" label="Memórias" active={path.startsWith('/memorias')} />

      {/* FAB */}
      <Link href="/compor" style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--gradient-brand)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 -2px 0 4px var(--surface-card), var(--shadow-accent)',
        marginTop: -18,
        textDecoration: 'none', flexShrink: 0,
      }}>
        <Icon name="plus" size={24} color="#fff" strokeWidth={2.5} />
      </Link>

      <TabItem href="/conquistas" icon="award" label="Conquistas" active={path.startsWith('/conquistas')} />
      <TabItem href="/perfil" icon="user" label="Perfil" active={path.startsWith('/perfil')} />
    </div>
  )
}

function TabItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      textDecoration: 'none', width: 60,
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      transition: 'color 140ms ease',
    }}>
      <Icon name={icon} size={22} color={active ? 'var(--accent)' : 'var(--text-muted)'} />
      <span style={{ fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
    </Link>
  )
}
