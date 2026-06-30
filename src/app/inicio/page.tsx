'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'
import { getMemories } from '@/lib/supabase/queries'
import { formatShortDate, calculateCurrentWeek, weeksUntilDue } from '@/lib/utils'
import type { Memory } from '@/types'

export default function DashboardPage() {
  const { user, baby, isLoading } = useApp()
  const router = useRouter()
  const [recentMemory, setRecentMemory] = useState<Memory | null>(null)
  const [memoriesLoading, setMemoriesLoading] = useState(false)

  useEffect(() => {
    if (!baby?.id) return
    setMemoriesLoading(true)
    getMemories(baby.id).then(mems => {
      setRecentMemory(mems[0] ?? null)
    }).finally(() => setMemoriesLoading(false))
  }, [baby?.id])

  // ── Global loading spinner ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-page)' }}>
        <span style={{
          width: 40, height: 40, border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', display: 'inline-block',
        }} />
      </div>
    )
  }

  // ── Top bar (shared) ──────────────────────────────────────────────────────
  const TopBar = () => (
    <div style={{ background: '#fff', paddingBottom: 0 }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
        <img src="/logo-full.png" alt="Memora Bebê" style={{ height: 44, width: 'auto' }} />
        <Link href="/notificacoes" style={{ position: 'relative', textDecoration: 'none', display: 'flex' }}>
          <Icon name="bell" size={22} color="var(--text-strong)" />
          <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#E05050', border: '1.5px solid white' }} />
        </Link>
      </div>
    </div>
  )

  // ── No baby: empty state ──────────────────────────────────────────────────
  if (!baby) {
    return (
      <div style={{ flex: 1, background: 'var(--surface-page)', overflowY: 'auto' }}>
        <TopBar />
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-strong)' }}>
            Olá, {user?.name || 'Mamãe'}! 👋
          </h1>

          <div style={{
            background: '#fff', borderRadius: 24, padding: 28,
            border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
            }}>👶</div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)', marginBottom: 8 }}>
                Vamos começar!
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                Adicione o perfil do seu bebê e comece a registrar cada momento especial 💜
              </p>
            </div>

            <Button fullWidth onClick={() => router.push('/criar-bebe/passo-1')}>
              Adicionar perfil do bebê
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Baby exists: full dashboard ───────────────────────────────────────────
  const week = calculateCurrentWeek(baby)
  const weeksLeft = weeksUntilDue(baby)
  const progress = Math.min(100, (week / 40) * 100)
  const isNascido = baby.status === 'nascido'

  return (
    <div style={{ flex: 1, background: 'var(--surface-page)', overflowY: 'auto' }}>
      <TopBar />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Greeting */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-strong)' }}>
            Olá, {user?.name || 'Mamãe'}! 👋
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>
            {baby.name} está crescendo lindamente 💜
          </p>
        </div>

        {/* Hero card — pregnancy or birthday */}
        {isNascido ? (
          // Birthday / born card
          <div style={{
            background: 'var(--gradient-brand)', borderRadius: 24, padding: 20,
            boxShadow: 'var(--shadow-accent)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
                  Bebê nascido(a)
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: '#fff' }}>{baby.name}</span>
                </div>
                {baby.birth_date && (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', fontFamily: 'var(--font-body)', marginTop: 6 }}>
                    Nasceu em{' '}
                    {new Date(baby.birth_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                🎀
              </div>
            </div>
          </div>
        ) : (
          // Pregnancy progress card
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
                  Faltam {weeksLeft} semana{weeksLeft !== 1 ? 's' : ''} para o grande dia
                </p>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>Progresso</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.22)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 999 }} />
                  </div>
                </div>
              </div>

              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                👶
              </div>
            </div>
          </div>
        )}

        {/* Conquistas section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-strong)' }}>Conquistas</span>
            <Link href="/conquistas" style={{ fontSize: 13, color: 'var(--text-accent)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Ver todas</Link>
          </div>
          <Link href="/conquistas" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', borderRadius: 18, padding: '16px 20px',
              border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'var(--gradient-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>🏆</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', marginBottom: 3 }}>
                  Veja suas conquistas
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  Marcos desbloqueados e medalhas
                </p>
              </div>
              <Icon name="chevron-right" size={18} color="var(--text-muted)" />
            </div>
          </Link>
        </div>

        {/* Recent memory */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-strong)' }}>Memória recente</span>
            <Link href="/memorias" style={{ fontSize: 13, color: 'var(--text-accent)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>Ver todas</Link>
          </div>

          {memoriesLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <span style={{
                width: 28, height: 28, border: '2px solid var(--border-subtle)',
                borderTopColor: 'var(--accent)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
            </div>
          ) : recentMemory ? (
            <Link href="/memorias" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: 100, background: recentMemory.bg_color || 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {recentMemory.type === 'audio' ? (
                    <Icon name="mic" size={32} color="#fff" strokeWidth={1.5} />
                  ) : recentMemory.type === 'video' ? (
                    <Icon name="video" size={32} color="#fff" strokeWidth={1.5} />
                  ) : recentMemory.media_url ? (
                    <img src={recentMemory.media_url} alt={recentMemory.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
                  ) : (
                    <span>{recentMemory.emoji || '💜'}</span>
                  )}
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
          ) : (
            <div style={{
              background: '#fff', borderRadius: 18, padding: '24px 20px',
              border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center',
            }}>
              <span style={{ fontSize: 36 }}>✨</span>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                Nenhuma memória ainda. Que tal registrar a primeira?
              </p>
              <Button size="sm" onClick={() => router.push('/compor')}>
                Criar memória
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
