'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'
import { useApp } from '@/contexts/AppContext'
import { getMemories, updateBaby, createMemory, unlockAchievement } from '@/lib/supabase/queries'
import { uploadToR2 } from '@/lib/r2/upload'
import { formatShortDate, calculateCurrentWeek, weeksUntilDue, MEMORY_COLORS, formatLocalDate, getLifeStage } from '@/lib/utils'
import { useSignedUrl } from '@/hooks/useSignedUrl'
import type { Memory } from '@/types'

export default function DashboardPage() {
  const { user, baby, setBaby, isLoading } = useApp()
  const router = useRouter()
  const [recentMemory, setRecentMemory] = useState<Memory | null>(null)
  const [memoriesLoading, setMemoriesLoading] = useState(false)
  const signedRecentUrl = useSignedUrl(recentMemory?.media_url)

  // ── Nasceu modal ──────────────────────────────────────────────────────────
  const [showNasceu, setShowNasceu] = useState(false)
  const [nasceuDate, setNasceuDate] = useState(() => new Date().toISOString().split('T')[0])
  const [nasceuPhoto, setNasceuPhoto] = useState<File | null>(null)
  const [nasceuPhotoPreview, setNasceuPhotoPreview] = useState<string | null>(null)
  const [nasceuSaving, setNasceuSaving] = useState(false)
  const nasceuFileRef = useRef<HTMLInputElement>(null)

  function handleNasceuPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNasceuPhoto(file)
    setNasceuPhotoPreview(URL.createObjectURL(file))
  }

  async function handleConfirmNasceu() {
    if (!baby?.id || !user?.id) return
    setNasceuSaving(true)
    try {
      await updateBaby(baby.id, { status: 'nascido', birth_date: nasceuDate })
      setBaby({ ...baby, status: 'nascido', birth_date: nasceuDate })

      if (nasceuPhoto) {
        const mediaUrl = await uploadToR2(nasceuPhoto, 'memories')
        await createMemory({
          baby_id: baby.id,
          user_id: user.id,
          type: 'foto',
          title: `Nascimento de ${baby.name} 🎉`,
          body: '',
          life_stage: getLifeStage(new Date().toISOString(), baby.birth_date),
          media_url: mediaUrl,
          bg_color: MEMORY_COLORS[getLifeStage(new Date().toISOString(), baby.birth_date)] ?? MEMORY_COLORS['ano-1'],
          emoji: '🎀',
          week: baby.week,
        })
        const allMems = await getMemories(baby.id)
        if (allMems.length === 1) unlockAchievement(baby.id, user.id, 'primeira-memoria', 50).catch(() => {})
        unlockAchievement(baby.id, user.id, 'fotografo', 150).catch(() => {})
      }

      setShowNasceu(false)
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setNasceuSaving(false)
    }
  }

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
    <>
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
                    {formatLocalDate(baby.birth_date)}
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
                  {weeksLeft <= 0 ? 'Chegou o grande dia! 🎉' : `Faltam ${weeksLeft} semana${weeksLeft !== 1 ? 's' : ''} para o grande dia`}
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

                {/* Botão "Nasceu" — aparece na última semana ou após a DPP */}
                {weeksLeft <= 1 && (
                  <button
                    onClick={() => setShowNasceu(true)}
                    style={{
                      marginTop: 16, padding: '10px 20px', borderRadius: 99,
                      background: '#fff', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                      color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 2px 12px rgba(0,0,0,.15)',
                    }}
                  >
                    🎉 Ele/Ela nasceu!
                  </button>
                )}
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
                    <img src={signedRecentUrl} alt={recentMemory.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
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

    {/* ── Modal "Nasceu" ──────────────────────────────────────────────── */}

    {showNasceu && (
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18,17,26,.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        onClick={() => setShowNasceu(false)}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)', alignSelf: 'center' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)', margin: '0 0 6px' }}>
              Ele/Ela nasceu!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
              Registre este momento incrível 💜
            </p>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>
              Data de nascimento
            </label>
            <input
              type="date"
              value={nasceuDate}
              onChange={e => setNasceuDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 12, fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-strong)', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>
              Primeira foto <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input ref={nasceuFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleNasceuPhotoChange} />
            {nasceuPhotoPreview ? (
              <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 14, overflow: 'hidden', background: '#000' }}>
                <img src={nasceuPhotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => { setNasceuPhoto(null); setNasceuPhotoPreview(null) }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="x" size={16} color="#fff" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => nasceuFileRef.current?.click()}
                style={{ width: '100%', height: 100, borderRadius: 14, border: '2px dashed var(--border-strong)', background: 'var(--violet-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
              >
                <Icon name="camera" size={24} color="var(--accent)" />
                <span style={{ fontSize: 14, color: 'var(--accent)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Adicionar foto</span>
              </button>
            )}
          </div>

          <Button fullWidth size="lg" onClick={handleConfirmNasceu} loading={nasceuSaving}>
            Confirmar nascimento 🎀
          </Button>
        </div>
      </div>
    )}
    </>
  )
}
