'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useApp } from '@/contexts/AppContext'
import { getAchievements } from '@/lib/supabase/queries'
import type { Achievement } from '@/types'

const LEVELS = [
  { level: 1, label: 'Nível 1 — Sementinha',  minXP: 0,   maxXP: 100,  emoji: '🌱' },
  { level: 2, label: 'Nível 2 — Brotinho',     minXP: 101, maxXP: 300,  emoji: '🌿' },
  { level: 3, label: 'Nível 3 — Árvore Jovem', minXP: 301, maxXP: 600,  emoji: '🌳' },
  { level: 4, label: 'Nível 4 — Árvore Plena', minXP: 601, maxXP: 9999, emoji: '🌲' },
]

export default function ArvoreVidaPage() {
  const router = useRouter()
  const { baby } = useApp()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!baby?.id) { setLoading(false); return }
    getAchievements(baby.id).then(setAchievements).catch(console.error).finally(() => setLoading(false))
  }, [baby?.id])

  const totalXP = achievements.filter(a => a.unlocked).reduce((s, a) => s + a.xp, 0)
  const currentLevel = LEVELS.findLast(l => totalXP >= l.minXP) ?? LEVELS[0]
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)

  const levelProgress = nextLevel
    ? Math.min(100, Math.round(((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100))
    : 100

  // Árvore SVG dinâmica baseada no nível
  const treeSize = currentLevel.level
  const trunkH = 40 + treeSize * 15
  const colors = ['#C4A3DF', '#A47BC8', '#8B5CF6', '#6B53AE']
  const treeColor = colors[currentLevel.level - 1]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface-page)' }}>
      <div style={{ background: '#fff' }}>
        <StatusBar />
        <ScreenHeader title="Árvore da Vida" onBack={() => router.back()} />
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

        {/* Árvore SVG */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '24px 20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <svg viewBox="0 0 200 200" width="160" height="160">
            {/* Solo */}
            <ellipse cx="100" cy="188" rx="50" ry="10" fill="#DDD5F3" opacity="0.5" />

            {/* Tronco */}
            <rect x="90" y={190 - trunkH} width="20" height={trunkH} rx="6" fill={treeColor} opacity="0.8" />

            {currentLevel.level >= 1 && (
              <ellipse cx="100" cy={190 - trunkH - 20} rx={25 + treeSize * 5} ry={20 + treeSize * 4} fill={treeColor} opacity="0.5" />
            )}
            {currentLevel.level >= 2 && (
              <ellipse cx="100" cy={190 - trunkH - 35} rx={30 + treeSize * 5} ry={22 + treeSize * 3} fill={treeColor} opacity="0.65" />
            )}
            {currentLevel.level >= 3 && (
              <ellipse cx="100" cy={190 - trunkH - 52} rx={35 + treeSize * 4} ry={25 + treeSize * 2} fill={treeColor} opacity="0.8" />
            )}
            {currentLevel.level >= 4 && (
              <ellipse cx="100" cy={190 - trunkH - 72} rx={38} ry={28} fill={treeColor} />
            )}

            {/* Decorações por nível */}
            {currentLevel.level >= 2 && <text x="70" y="90" fontSize="18">💜</text>}
            {currentLevel.level >= 3 && <text x="118" y="80" fontSize="16">🌸</text>}
            {currentLevel.level >= 4 && <text x="80" y="60" fontSize="16">⭐</text>}

            {/* Estado zero — sementinha */}
            {currentLevel.level === 1 && totalXP === 0 && (
              <text x="85" y="175" fontSize="22">🌱</text>
            )}
          </svg>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-strong)', margin: 0 }}>
              {currentLevel.emoji} {currentLevel.label}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '4px 0 0' }}>
              {totalXP === 0 ? 'Registre memórias para fazer sua árvore crescer!' : `${totalXP} XP acumulados`}
            </p>
          </div>

          {nextLevel && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  Progresso para {nextLevel.emoji} {nextLevel.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  {levelProgress}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${levelProgress}%`, background: 'var(--gradient-brand)', borderRadius: 999, transition: 'width 360ms ease' }} />
              </div>
            </div>
          )}
        </div>

        {/* Níveis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: 0 }}>Jornada da árvore</p>
          {LEVELS.map(l => {
            const isActive   = l.level === currentLevel.level
            const isComplete = l.level < currentLevel.level
            const isLocked   = l.level > currentLevel.level
            return (
              <div key={l.level} style={{ background: isActive ? 'var(--gradient-brand)' : '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: isActive ? 'var(--shadow-accent)' : 'var(--shadow-sm)', opacity: isLocked ? 0.6 : 1 }}>
                <span style={{ fontSize: 28 }}>{l.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: isActive ? '#fff' : 'var(--text-strong)', margin: 0 }}>{l.label}</p>
                  <p style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,.8)' : 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>
                    {l.minXP === 0 ? 'Início da jornada' : `A partir de ${l.minXP} XP`}
                  </p>
                </div>
                {isComplete && <span style={{ fontSize: 18 }}>✅</span>}
                {isActive && (
                  <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 8, padding: '3px 8px' }}>
                    <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Atual</span>
                  </div>
                )}
                {isLocked && <span style={{ fontSize: 16 }}>🔒</span>}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        {totalXP === 0 && (
          <div style={{ background: 'var(--violet-50)', borderRadius: 18, padding: '20px', textAlign: 'center', border: '1.5px dashed var(--violet-200)' }}>
            <p style={{ fontSize: 32, margin: '0 0 8px' }}>🌱</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--accent)', margin: '0 0 6px' }}>
              Plante sua primeira semente!
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              Registre memórias, convide a família e crie mensagens para o futuro para ganhar XP e fazer sua árvore crescer.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
