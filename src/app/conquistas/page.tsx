'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import AppShell from '@/components/layout/AppShell'
import { useApp } from '@/contexts/AppContext'
import { getAchievements } from '@/lib/supabase/queries'
import type { Achievement } from '@/types'

type Tab = 'todas' | 'alcancadas' | 'em-breve'

const ACHIEVEMENT_ACTIONS: Record<string, { href: string; label: string }> = {
  'primeira-memoria':   { href: '/compor/historia',  label: 'Escrever primeira memória' },
  'cinco-memorias':     { href: '/compor/historia',  label: 'Escrever mais memórias' },
  'escritor':           { href: '/memorias',         label: 'Ver minhas memórias' },
  'vinte-memorias':     { href: '/compor',           label: 'Registrar nova memória' },
  'cinquenta-memorias': { href: '/compor',           label: 'Registrar nova memória' },
  'cem-memorias':       { href: '/compor',           label: 'Registrar nova memória' },
  'primeira-foto':      { href: '/compor',           label: 'Adicionar primeira foto' },
  'fotografo':          { href: '/compor',           label: 'Adicionar foto' },
  'dez-fotos':          { href: '/compor',           label: 'Adicionar foto' },
  'trinta-fotos':       { href: '/compor',           label: 'Adicionar foto' },
  'narrador':           { href: '/compor/audio',     label: 'Gravar um áudio' },
  'cinco-audios':       { href: '/compor/audio',     label: 'Gravar mais áudios' },
  'primeiro-video':     { href: '/compor',           label: 'Gravar primeiro vídeo' },
  'cinco-videos':       { href: '/compor',           label: 'Gravar mais vídeos' },
  'primeira-historia':  { href: '/compor/historia',  label: 'Escrever história' },
  'memoria-detalhada':  { href: '/compor/historia',  label: 'Escrever história longa' },
  'semana-seguida':     { href: '/compor',           label: 'Registrar memória hoje' },
  'marco-mes':          { href: '/memorias',         label: 'Continue registrando' },
  'tres-meses':         { href: '/compor',           label: 'Mantenha a sequência' },
  'albumzinho':         { href: '/compor',           label: 'Completar o álbum' },
  'primeiro-membro':    { href: '/perfil',           label: 'Convidar familiar' },
  'familia-unida':      { href: '/perfil',           label: 'Convidar mais familiares' },
  'grande-familia':     { href: '/perfil',           label: 'Convidar mais familiares' },
  'familia-completa':   { href: '/perfil',           label: 'Convidar a família toda' },
  'voz-familia':        { href: '/perfil',           label: 'Engajar familiares' },
  'raizes-vivas':       { href: '/perfil',           label: 'Engajar familiares' },
  'mensagem-tempo':     { href: '/perfil/mensagens', label: 'Criar mensagem para o futuro' },
  'tres-mensagens':     { href: '/perfil/mensagens', label: 'Criar mais mensagens' },
  'cinco-mensagens':    { href: '/perfil/mensagens', label: 'Criar mais mensagens' },
  'mensagem-1-ano':     { href: '/perfil/mensagens', label: 'Escrever para 1 ano de idade' },
  'mensagem-18-anos':   { href: '/perfil/mensagens', label: 'Escrever para os 18 anos' },
  'mensagem-formatura': { href: '/perfil/mensagens', label: 'Escrever para a formatura' },
  'primeiro-mes':       { href: '/compor/historia',  label: 'Registrar o 1º mês' },
  'seis-meses-vida':    { href: '/compor/historia',  label: 'Registrar os 6 meses' },
  'primeiro-ano':       { href: '/compor/historia',  label: 'Registrar o 1º aniversário' },
  'segundo-ano':        { href: '/compor/historia',  label: 'Registrar o 2º aniversário' },
  'terceiro-ano':       { href: '/compor/historia',  label: 'Registrar o 3º aniversário' },
  'quinto-ano':         { href: '/compor/historia',  label: 'Registrar o 5º aniversário' },
  'primeiros-passos':   { href: '/compor/historia',  label: 'Registrar os primeiros passos' },
  'primeira-palavra':   { href: '/compor/historia',  label: 'Registrar a primeira palavra' },
  'primeiro-sorriso':   { href: '/compor',           label: 'Registrar o primeiro sorriso' },
  'primeiro-dente':     { href: '/compor/historia',  label: 'Registrar o primeiro dentinho' },
  'primeiro-natal':     { href: '/compor/historia',  label: 'Registrar o Natal' },
  'perfil-completo':    { href: '/perfil',           label: 'Completar perfil do bebê' },
  'foto-perfil':        { href: '/perfil',           label: 'Adicionar foto de perfil' },
  'explorador':         { href: '/inicio',           label: 'Explorar o app' },
}

// XP thresholds for levels 1-50; gap increases by 50 every 5 levels
const XP_THRESHOLDS = [
  0, 100, 200, 300, 400,               // 1-5   (gap 100)
  550, 700, 850, 1000, 1150,           // 6-10  (gap 150)
  1350, 1550, 1750, 1950, 2150,        // 11-15 (gap 200)
  2400, 2650, 2900, 3150, 3400,        // 16-20 (gap 250)
  3700, 4000, 4300, 4600, 4900,        // 21-25 (gap 300)
  5250, 5600, 5950, 6300, 6650,        // 26-30 (gap 350)
  7050, 7450, 7850, 8250, 8650,        // 31-35 (gap 400)
  9100, 9550, 10000, 10450, 10900,     // 36-40 (gap 450)
  11400, 11900, 12400, 12900, 13400,   // 41-45 (gap 500)
  14000, 14600, 15200, 15800, 16400,   // 46-50 (gap 600)
]

function levelFromXP(xp: number) {
  let level = 1
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) { level = i + 1; break }
  }
  const curr = XP_THRESHOLDS[level - 1]
  const next = level < 50 ? XP_THRESHOLDS[level] : null
  const progress = next ? Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100)) : 100
  const detail = next ? `${xp}/${next} XP` : 'Nível máximo!'
  return { level, label: `Nível ${level}`, progress, detail }
}

export default function ConquistasPage() {
  const router = useRouter()
  const { baby } = useApp()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('todas')

  useEffect(() => {
    if (!baby?.id) { setLoading(false); return }
    getAchievements(baby.id).then(setAchievements).catch(console.error).finally(() => setLoading(false))
  }, [baby?.id])

  const totalXP = achievements.filter(a => a.unlocked).reduce((s, a) => s + a.xp, 0)
  const { label: levelLabel, progress, detail } = levelFromXP(totalXP)

  const filtered = achievements.filter(a =>
    tab === 'todas' ? true : tab === 'alcancadas' ? a.unlocked : !a.unlocked
  )

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100dvh', paddingBottom: 32 }}>
        <StatusBar />
        <div style={{ padding: '8px 20px 0' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)', margin: 0 }}>Conquistas</h1>
        </div>

        <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Level card */}
          <div style={{ background: 'var(--gradient-brand)', borderRadius: 24, padding: 20, boxShadow: 'var(--shadow-accent)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>🏅</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', margin: 0 }}>{levelLabel}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', margin: '2px 0 10px', fontFamily: 'var(--font-body)' }}>{detail}</p>
              <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 999, transition: 'width 360ms ease' }} />
              </div>
            </div>
            <button onClick={() => router.push('/conquistas/arvore')} style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 12, padding: '8px 12px', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Árvore 🌳
            </button>
          </div>

          {/* Tabs */}
          <div style={{ background: 'var(--surface-sunken)', padding: 3, borderRadius: 999, display: 'flex' }}>
            {(['todas','alcancadas','em-breve'] as Tab[]).map(v => (
              <button key={v} onClick={() => setTab(v)} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: 'none', cursor: 'pointer', background: tab===v ? '#fff' : 'transparent', fontFamily: 'var(--font-body)', fontWeight: tab===v ? 600 : 400, fontSize: 13, color: tab===v ? 'var(--text-strong)' : 'var(--text-muted)', boxShadow: tab===v ? 'var(--shadow-sm)' : 'none', transition: 'all 140ms' }}>
                {v === 'todas' ? 'Todas' : v === 'alcancadas' ? 'Alcançadas' : 'Em breve'}
              </button>
            ))}
          </div>

          {/* Achievement list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <span style={{ width: 32, height: 32, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {tab === 'alcancadas' ? 'Nenhuma conquista desbloqueada ainda.' : 'Todas conquistadas! 🎉'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(a => {
                const action = ACHIEVEMENT_ACTIONS[a.id]
                const clickable = !a.unlocked && !!action
                return (
                  <div
                    key={a.id}
                    onClick={() => clickable && router.push(action.href)}
                    style={{
                      background: '#fff', borderRadius: 14, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 14,
                      boxShadow: 'var(--shadow-sm)', cursor: clickable ? 'pointer' : 'default',
                      border: a.unlocked ? '1.5px solid var(--success-soft)' : '1.5px solid var(--border-subtle)',
                      transition: 'opacity 120ms',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.unlocked ? 'var(--success-soft)' : 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={a.unlocked ? 'check' : 'lock'} size={20} color={a.unlocked ? 'var(--success)' : 'var(--text-muted)'} strokeWidth={2.5} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: 0 }}>{a.title}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '2px 0 0', lineHeight: 1.4 }}>{a.description}</p>
                      {a.unlocked && a.unlocked_at ? (
                        <p style={{ fontSize: 11, color: 'var(--success)', fontFamily: 'var(--font-body)', margin: '4px 0 0', fontWeight: 600 }}>
                          ✓ Desbloqueada em {new Date(a.unlocked_at).toLocaleDateString('pt-BR')} · +{a.xp} XP
                        </p>
                      ) : action ? (
                        <p style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-body)', margin: '4px 0 0', fontWeight: 600 }}>
                          → {action.label}
                        </p>
                      ) : null}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: a.unlocked ? 'var(--success)' : 'var(--text-muted)', background: a.unlocked ? 'var(--success-soft)' : 'var(--surface-sunken)', padding: '3px 8px', borderRadius: 999 }}>
                        +{a.xp} XP
                      </span>
                      {clickable && <Icon name="chevron-right" size={16} color="var(--text-muted)" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  )
}
