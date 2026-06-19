'use client'

import { useState } from 'react'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { MOCK_ACHIEVEMENTS } from '@/lib/mock-data'

type Tab = 'todas' | 'alcancadas' | 'em-breve'

export default function ConquistasPage() {
  const [tab, setTab] = useState<Tab>('todas')

  const filtered = MOCK_ACHIEVEMENTS.filter((a) => {
    if (tab === 'todas') return true
    if (tab === 'alcancadas') return a.unlocked
    if (tab === 'em-breve') return !a.unlocked
    return true
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'alcancadas', label: 'Alcançadas' },
    { key: 'em-breve', label: 'Em breve' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', fontFamily: 'var(--font-body)' }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: '16px 20px 8px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--text-strong)', margin: 0 }}>
          Conquistas
        </h1>
      </div>

      {/* Level Card */}
      <div style={{ margin: '0 20px 20px', background: 'var(--gradient-brand)', borderRadius: 24, padding: '20px 24px', boxShadow: 'var(--shadow-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 48, lineHeight: 1 }}>🏅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 2 }}>
              Nível 3
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>340 / 500 XP</div>
            <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{ background: '#fff', borderRadius: 99, height: '100%', width: `${(340 / 500) * 100}%`, transition: 'width 0.4s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div style={{ margin: '0 20px 16px', background: 'var(--surface-sunken)', borderRadius: 14, padding: 4, display: 'flex', gap: 2 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: '9px 0',
              border: 'none',
              borderRadius: 11,
              fontFamily: 'var(--font-body)',
              fontWeight: tab === t.key ? 600 : 400,
              fontSize: 13,
              color: tab === t.key ? 'var(--text-strong)' : 'var(--text-muted)',
              background: tab === t.key ? 'var(--surface-card)' : 'transparent',
              boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Achievements List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((achievement) => (
          <div
            key={achievement.id}
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
            {/* Icon circle */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: achievement.unlocked ? 'var(--success-soft)' : 'var(--surface-sunken)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {achievement.unlocked ? (
                <Icon name="check" size={20} color="var(--success)" strokeWidth={2.5} />
              ) : (
                <Icon name="lock" size={18} color="var(--text-muted)" strokeWidth={2} />
              )}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', marginBottom: 2 }}>
                {achievement.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{achievement.description}</div>
              <div style={{ fontSize: 12, color: 'var(--text-accent)', fontWeight: 600, marginTop: 3 }}>+{achievement.xp} XP</div>
            </div>

            {/* Chevron for locked */}
            {!achievement.unlocked && (
              <Icon name="chevron-right" size={18} color="var(--text-muted)" />
            )}
          </div>
        ))}
      </div>

      {/* Árvore da Vida CTA */}
      <div style={{ padding: '20px 20px 32px' }}>
        <Link href="/conquistas/arvore" style={{ textDecoration: 'none' }}>
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--violet-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="leaf" size={20} color="var(--accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-strong)' }}>Árvore da Vida</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Veja seu progresso visual</div>
            </div>
            <Icon name="chevron-right" size={18} color="var(--text-muted)" />
          </div>
        </Link>
      </div>
    </div>
  )
}
