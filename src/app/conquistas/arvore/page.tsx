'use client'

import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'

const levels = [
  { num: 1, label: 'Nível 1 — Sementinha', milestones: '20/20 marcos', progress: 1, status: 'completed' },
  { num: 2, label: 'Nível 2 — Brotinho', milestones: '20/20 marcos', progress: 1, status: 'completed' },
  { num: 3, label: 'Nível 3 — Árvore Jovem', milestones: '12/20 marcos', progress: 12 / 20, status: 'active' },
  { num: 4, label: 'Nível 4 — Árvore Plena', milestones: '0/20 marcos', progress: 0, status: 'locked' },
]

export default function ArvoreVidaPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', fontFamily: 'var(--font-body)' }}>
      <StatusBar />
      <ScreenHeader title="Árvore da Vida" onBack={() => router.back()} />

      {/* SVG Tree */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px 8px', position: 'relative' }}>
        <div style={{ position: 'relative', width: 220, height: 240 }}>
          <svg width="220" height="240" viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg">
            {/* Trunk */}
            <rect x="95" y="170" width="30" height="60" rx="8" fill="#9B7DC8" />
            {/* Ellipses: outermost to innermost */}
            <ellipse cx="110" cy="130" rx="95" ry="80" fill="#4E4490" />
            <ellipse cx="110" cy="125" rx="80" ry="67" fill="#6B53AE" />
            <ellipse cx="110" cy="120" rx="65" ry="54" fill="#8B6EC8" />
            <ellipse cx="110" cy="115" rx="50" ry="42" fill="#A88DD8" />
            <ellipse cx="110" cy="110" rx="35" ry="30" fill="#C4AAEC" />
          </svg>
          {/* Emoji decorations */}
          <span style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', fontSize: 22 }}>❤️</span>
          <span style={{ position: 'absolute', top: 60, left: 30, fontSize: 18 }}>🌸</span>
          <span style={{ position: 'absolute', top: 60, right: 30, fontSize: 18 }}>🌸</span>
          <span style={{ position: 'absolute', top: 100, left: 14, fontSize: 16 }}>❤️</span>
          <span style={{ position: 'absolute', top: 100, right: 14, fontSize: 16 }}>❤️</span>
        </div>
      </div>

      {/* Level rows */}
      <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {levels.map((level) => {
          const isActive = level.status === 'active'
          const isCompleted = level.status === 'completed'
          const isLocked = level.status === 'locked'

          return (
            <div
              key={level.num}
              style={{
                borderRadius: 16,
                padding: '14px 16px',
                background: isActive ? 'var(--gradient-brand)' : isCompleted ? 'var(--surface-card)' : 'var(--surface-sunken)',
                boxShadow: isActive ? 'var(--shadow-accent)' : isCompleted ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: isActive ? 'rgba(255,255,255,0.2)' : isCompleted ? 'var(--violet-100)' : 'var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isLocked ? (
                  <Icon name="lock" size={18} color="var(--text-muted)" strokeWidth={2} />
                ) : (
                  <Icon name="leaf" size={18} color={isActive ? '#fff' : 'var(--accent)'} strokeWidth={2} />
                )}
              </div>

              {/* Label */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: isActive ? '#fff' : isLocked ? 'var(--text-muted)' : 'var(--text-strong)',
                  }}
                >
                  {level.label}
                </div>
                <div style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', marginTop: 2 }}>
                  {level.milestones}
                </div>
                {isActive && (
                  <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.3)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                    <div style={{ background: '#fff', borderRadius: 99, height: '100%', width: `${level.progress * 100}%` }} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* XP Total */}
      <div style={{ margin: '16px 20px 32px', background: 'var(--surface-card)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="zap" size={20} color="var(--accent)" />
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>340</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 6 }}>XP total acumulado</span>
        </div>
      </div>
    </div>
  )
}
