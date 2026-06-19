'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { MOCK_MEMORIES } from '@/lib/mock-data'
import { formatShortDate } from '@/lib/utils'

const MILESTONES = [
  { icon: '📸', iconBg: 'var(--violet-100)', title: 'Primeira foto do ultrassom', sub: '20 semanas', badge: 'Alcançado' },
  { icon: '💜', iconBg: 'var(--rose-100)', title: 'Primeira movimentação', sub: 'Sentiu o bebê se mexer', badge: 'Semana 18' },
  { icon: '🏥', iconBg: 'var(--success-soft)', title: 'Consulta pré-natal', sub: 'Próxima: em 2 semanas', badge: 'Agendado' },
]

export default function DashboardPage() {
  const { user, baby } = useApp()
  const router = useRouter()
  const recentMemory = MOCK_MEMORIES[0]
  const week = baby?.week || 24
  const weeksLeft = 40 - week
  const progress = (week / 40) * 100

  return (
    <div style={{ flex: 1, background: 'var(--surface-page)', overflowY: 'auto' }}>
      <div style={{ background: 'var(--surface-card)', paddingBottom: 0 }}>
        <StatusBar />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>💜</div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-strong)' }}>memora</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>bebê</span>
              </div>
            </div>
          </div>
          <Link href="/notificacoes" style={{ position: 'relative', textDecoration: 'none', display: 'flex' }}>
            <Icon name="bell" size={22} color="var(--text-strong)" />
            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#E05050', border: '1.5px solid white' }} />
          </Link>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Greeting */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-strong)' }}>
            Olá, {user?.name || 'Mamãe'}! 👋
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
            {baby?.name} está crescendo lindamente 💜
          </p>
        </div>

        {/* Pregnancy hero card */}
        <div style={{
          background: 'var(--gradient-brand)', borderRadius: 24, padding: 20,
          boxShadow: 'var(--shadow-accent)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: '#fff' }}>{week}ª</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,.85)', fontFamily: 'var(--font-body)' }}>semana da gestação</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
                Faltam {weeksLeft} semanas para o grande dia
              </p>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>Progresso</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.22)', overflow: 'hidden' }}>
                  <div className="progress-fill" style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 999 }} />
                </div>
              </div>
            </div>

            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
              👶
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-strong)' }}>Marcos</span>
            <Link href="/conquistas" style={{ fontSize: 13, color: 'var(--text-accent)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Ver todas</Link>
          </div>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            {MILESTONES.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderBottom: i < MILESTONES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: m.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{m.sub}</p>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--accent)', background: 'var(--violet-50)', padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {m.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent memory */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-strong)' }}>Memória recente</span>
            <Link href="/memorias" style={{ fontSize: 13, color: 'var(--text-accent)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Ver todas</Link>
          </div>
          <Link href="/memorias" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: 100, background: recentMemory.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
                {recentMemory.emoji}
              </div>
              <div style={{ padding: '14px 14px', flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', marginBottom: 4 }}>{recentMemory.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 8 }}>{formatShortDate(recentMemory.created_at)}</p>
                <p style={{ fontSize: 13, color: 'var(--text-body)', fontFamily: 'var(--font-body)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {recentMemory.body}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
