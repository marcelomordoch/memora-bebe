'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { getAchievements } from '@/lib/supabase/queries'
import type { Achievement } from '@/types'

type Tab = 'todas' | 'alcancadas' | 'em-breve'

function calcLevel(xp: number): { level: number; currentXp: number; nextXp: number } {
  if (xp <= 100) return { level: 1, currentXp: xp, nextXp: 100 }
  if (xp <= 300) return { level: 2, currentXp: xp - 100, nextXp: 200 }
  if (xp <= 600) return { level: 3, currentXp: xp - 300, nextXp: 300 }
  return { level: 4, currentXp: xp - 600, nextXp: 600 }
}

export default function ConquistasPage() {
  const { baby } = useApp()
  const [tab, setTab] = useState<Tab>('todas')
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!baby?.id) return
    getAchievements(baby.id)
      .then(setAchievements)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [baby?.id])

  const totalXP = achievements.filter((a) => a.unlocked).reduce((s, a) => s + (a.xp ?? 0), 0)
  const { level, currentXp, nextXp } = calcLevel(totalXP)

  const filtered = achievements.filter((a) => {
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
    <div style={{ minHeight: '100vh', background: '#F4F3F7', fontFamily: 'Inter, sans-serif', paddingBottom: 32 }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: '16px 20px 8px' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 26, color: '#2E2C4A', margin: 0 }}>
          Conquistas
        </h1>
      </div>

      {/* Level Card */}
      <div style={{ margin: '0 20px 20px', background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', borderRadius: 24, padding: '20px 24px', boxShadow: '0 4px 20px rgba(107,83,174,0.35)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
            <span style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>🏅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 2 }}>
                Nível {level}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>
                {currentXp} / {nextXp} XP {level < 4 ? 'para o próximo nível' : '(máximo!)'}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{ background: '#fff', borderRadius: 99, height: '100%', width: `${Math.min(100, (currentXp / nextXp) * 100)}%`, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Segmented Tabs */}
      <div style={{ margin: '0 20px 16px', background: '#ECEAF2', borderRadius: 14, padding: 4, display: 'flex', gap: 2 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: '9px 0',
              border: 'none',
              borderRadius: 11,
              fontFamily: 'Inter, sans-serif',
              fontWeight: tab === t.key ? 600 : 400,
              fontSize: 13,
              color: tab === t.key ? '#2E2C4A' : '#8B89B0',
              background: tab === t.key ? '#fff' : 'transparent',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
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
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8B89B0', fontSize: 14 }}>Carregando conquistas...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8B89B0', fontSize: 14 }}>Nenhuma conquista encontrada.</div>
        )}
        {filtered.map((achievement) => (
          <div key={achievement.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: achievement.unlocked ? '#E2F1EA' : '#ECEAF2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {achievement.unlocked
                ? <Icon name="check" size={20} color="#4F9E7C" strokeWidth={2.5} />
                : <Icon name="lock" size={18} color="#8B89B0" strokeWidth={2} />
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#2E2C4A', marginBottom: 2 }}>{achievement.title}</div>
              <div style={{ fontSize: 13, color: '#8B89B0' }}>{achievement.description}</div>
              <div style={{ fontSize: 12, color: '#6B53AE', fontWeight: 600, marginTop: 3 }}>+{achievement.xp} XP</div>
            </div>
            {!achievement.unlocked && <Icon name="chevron-right" size={18} color="#8B89B0" />}
          </div>
        ))}
      </div>

      {/* Árvore da Vida CTA */}
      <div style={{ padding: '20px 20px 32px' }}>
        <Link href="/conquistas/arvore" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', border: '1.5px solid #E7E5F0', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#E7E1F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="leaf" size={20} color="#6B53AE" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#2E2C4A' }}>Árvore da Vida</div>
              <div style={{ fontSize: 13, color: '#8B89B0' }}>Veja seu progresso visual</div>
            </div>
            <Icon name="chevron-right" size={18} color="#8B89B0" />
          </div>
        </Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
