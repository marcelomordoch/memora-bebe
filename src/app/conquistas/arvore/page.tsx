'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useApp } from '@/contexts/AppContext'
import { getAchievements } from '@/lib/supabase/queries'
import type { Achievement } from '@/types'

const LEVELS = [
  { level:  1, label: 'Nível 1 — Sementinha',            minXP: 0,     emoji: '🌱' },
  { level:  2, label: 'Nível 2 — Brotinho',              minXP: 100,   emoji: '🌿' },
  { level:  3, label: 'Nível 3 — Rebento',               minXP: 200,   emoji: '🪴' },
  { level:  4, label: 'Nível 4 — Folhinha',              minXP: 300,   emoji: '🍃' },
  { level:  5, label: 'Nível 5 — Broto do Campo',        minXP: 400,   emoji: '🌾' },
  { level:  6, label: 'Nível 6 — Galho Verde',           minXP: 550,   emoji: '🌲' },
  { level:  7, label: 'Nível 7 — Tronco Jovem',          minXP: 700,   emoji: '🌳' },
  { level:  8, label: 'Nível 8 — Primeira Floração',     minXP: 850,   emoji: '🌸' },
  { level:  9, label: 'Nível 9 — Trevo da Sorte',        minXP: 1000,  emoji: '🍀' },
  { level: 10, label: 'Nível 10 — Girassol',             minXP: 1150,  emoji: '🌼' },
  { level: 11, label: 'Nível 11 — Tulipa',               minXP: 1350,  emoji: '🌷' },
  { level: 12, label: 'Nível 12 — Borboleta',            minXP: 1550,  emoji: '🦋' },
  { level: 13, label: 'Nível 13 — Passarinho',           minXP: 1750,  emoji: '🐦' },
  { level: 14, label: 'Nível 14 — Hibisco',              minXP: 1950,  emoji: '🌺' },
  { level: 15, label: 'Nível 15 — Flor do Sol',          minXP: 2150,  emoji: '🌻' },
  { level: 16, label: 'Nível 16 — Lua Crescente',        minXP: 2400,  emoji: '🌙' },
  { level: 17, label: 'Nível 17 — Estrela do Amor',      minXP: 2650,  emoji: '⭐' },
  { level: 18, label: 'Nível 18 — Luz da Família',       minXP: 2900,  emoji: '🌟' },
  { level: 19, label: 'Nível 19 — Magia do Lar',         minXP: 3150,  emoji: '💫' },
  { level: 20, label: 'Nível 20 — Brilho Eterno',        minXP: 3400,  emoji: '✨' },
  { level: 21, label: 'Nível 21 — Amanhecer',            minXP: 3700,  emoji: '🌅' },
  { level: 22, label: 'Nível 22 — Horizonte Novo',       minXP: 4000,  emoji: '🌄' },
  { level: 23, label: 'Nível 23 — Pico da Esperança',    minXP: 4300,  emoji: '🏔️' },
  { level: 24, label: 'Nível 24 — Arco-Íris',            minXP: 4600,  emoji: '🌈' },
  { level: 25, label: 'Nível 25 — Diamante Puro',        minXP: 4900,  emoji: '💎' },
  { level: 26, label: 'Nível 26 — Força do Amor',        minXP: 5250,  emoji: '🦁' },
  { level: 27, label: 'Nível 27 — Voo da Alegria',       minXP: 5600,  emoji: '🦅' },
  { level: 28, label: 'Nível 28 — Ondas da Memória',     minXP: 5950,  emoji: '🌊' },
  { level: 29, label: 'Nível 29 — Chama Viva',           minXP: 6300,  emoji: '🔥' },
  { level: 30, label: 'Nível 30 — Campeão(ã) do Amor',  minXP: 6650,  emoji: '🏆' },
  { level: 31, label: 'Nível 31 — Coroa da Família',     minXP: 7050,  emoji: '👑' },
  { level: 32, label: 'Nível 32 — Dedicação Total',      minXP: 7450,  emoji: '🎯' },
  { level: 33, label: 'Nível 33 — Mundo de Maravilhas',  minXP: 7850,  emoji: '🎪' },
  { level: 34, label: 'Nível 34 — Arte de Amar',         minXP: 8250,  emoji: '🎭' },
  { level: 35, label: 'Nível 35 — Guardião(ã) do Mundo', minXP: 8650,  emoji: '🌍' },
  { level: 36, label: 'Nível 36 — Viagem ao Infinito',   minXP: 9100,  emoji: '🚀' },
  { level: 37, label: 'Nível 37 — Guardião(ã) da Noite', minXP: 9550,  emoji: '🌃' },
  { level: 38, label: 'Nível 38 — Sol da Família',       minXP: 10000, emoji: '☀️' },
  { level: 39, label: 'Nível 39 — Universo do Amor',     minXP: 10450, emoji: '🌌' },
  { level: 40, label: 'Nível 40 — Coração de Ouro',      minXP: 10900, emoji: '💝' },
  { level: 41, label: 'Nível 41 — Vidente do Futuro',    minXP: 11400, emoji: '🔮' },
  { level: 42, label: 'Nível 42 — Fogos de Alegria',     minXP: 11900, emoji: '🎆' },
  { level: 43, label: 'Nível 43 — Estrela Cadente',      minXP: 12400, emoji: '🌠' },
  { level: 44, label: 'Nível 44 — Unicórnio da Fé',      minXP: 12900, emoji: '🦄' },
  { level: 45, label: 'Nível 45 — Castelo do Amor',      minXP: 13400, emoji: '🏰' },
  { level: 46, label: 'Nível 46 — Flor Eterna',          minXP: 14000, emoji: '🌹' },
  { level: 47, label: 'Nível 47 — Guardião(ã) Supremo(a)', minXP: 14600, emoji: '🛡️' },
  { level: 48, label: 'Nível 48 — Constelação',          minXP: 15200, emoji: '🪐' },
  { level: 49, label: 'Nível 49 — Infinito',             minXP: 15800, emoji: '♾️' },
  { level: 50, label: 'Nível 50 — Anjo Protetor',        minXP: 16400, emoji: '👼' },
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
  const currentLevel = [...LEVELS].reverse().find(l => totalXP >= l.minXP) ?? LEVELS[0]
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)

  const levelProgress = nextLevel
    ? Math.min(100, Math.round(((totalXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100))
    : 100

  // Árvore SVG com 10 estágios visuais (1 por grupo de 5 níveis)
  const stage = Math.ceil(currentLevel.level / 5) // 1-10
  const trunkH = 30 + stage * 8
  const colors = ['#D4B8E0','#C4A3DF','#B48ED8','#A47BC8','#9468B8','#8B5CF6','#7C4FE0','#6B3FCC','#5C30B8','#4B20A4']
  const treeColor = colors[stage - 1]

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
            <ellipse cx="100" cy="190" rx="55" ry="10" fill="#DDD5F3" opacity="0.4" />

            {/* Tronco */}
            <rect x="92" y={190 - trunkH} width="16" height={trunkH} rx="5" fill={treeColor} opacity="0.85" />

            {/* Copa — camadas que crescem com o estágio */}
            {stage >= 1 && <ellipse cx="100" cy={190 - trunkH - 18} rx={18 + stage * 2} ry={15 + stage} fill={treeColor} opacity="0.45" />}
            {stage >= 2 && <ellipse cx="100" cy={190 - trunkH - 30} rx={22 + stage * 2} ry={17 + stage} fill={treeColor} opacity="0.6"  />}
            {stage >= 3 && <ellipse cx="100" cy={190 - trunkH - 44} rx={26 + stage * 2} ry={19 + stage} fill={treeColor} opacity="0.75" />}
            {stage >= 4 && <ellipse cx="100" cy={190 - trunkH - 58} rx={30 + stage}     ry={21}         fill={treeColor} opacity="0.88" />}
            {stage >= 5 && <ellipse cx="100" cy={190 - trunkH - 72} rx={32 + stage}     ry={22}         fill={treeColor} />}
            {stage >= 6 && <ellipse cx="100" cy={190 - trunkH - 86} rx={34}             ry={22}         fill={treeColor} />}

            {/* Decorações progressivas */}
            {stage >= 2  && <text x="68"  y="110" fontSize="14">💜</text>}
            {stage >= 3  && <text x="120" y="100" fontSize="13">🌸</text>}
            {stage >= 4  && <text x="78"  y="82"  fontSize="13">⭐</text>}
            {stage >= 5  && <text x="110" y="75"  fontSize="13">🌟</text>}
            {stage >= 6  && <text x="60"  y="90"  fontSize="12">🍎</text>}
            {stage >= 7  && <text x="126" y="88"  fontSize="12">🦋</text>}
            {stage >= 8  && <text x="82"  y="58"  fontSize="12">🌈</text>}
            {stage >= 9  && <text x="105" y="52"  fontSize="12">💎</text>}
            {stage >= 10 && <text x="88"  y="35"  fontSize="16">👼</text>}

            {/* Estado zero — sementinha */}
            {stage === 1 && totalXP === 0 && <text x="84" y="178" fontSize="22">🌱</text>}
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
