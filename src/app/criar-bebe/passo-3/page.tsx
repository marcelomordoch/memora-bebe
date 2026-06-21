'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'

export default function CriarBebeStep3() {
  const router = useRouter()
  const { baby, setBaby } = useApp()
  const [about, setAbout] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: baby?.name,
          gender: baby?.gender,
          status: baby?.status ?? 'gestacao',
          due_date: baby?.due_date || null,
          birth_date: baby?.birth_date || null,
          week: baby?.week || null,
          about: about.trim() || null,
        }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        setError(json.error || 'Erro ao salvar. Tente novamente.')
        setLoading(false)
        return
      }

      setBaby(json.baby)
      router.push('/onboarding')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--gradient-brand)', padding: '16px 20px 56px' }}>
        <StatusBar light />
        <button onClick={() => router.back()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon name="chevron-left" color="#fff" />
        </button>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ height: 8, borderRadius: 999, width: 24, background: '#fff' }} />
          ))}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 4 }}>
          Foto e Apresentação
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>
          Quase lá! Esses detalhes são opcionais.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -28, flex: 1, padding: '28px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>

        {/* Resumo do que foi preenchido */}
        {baby?.name && (
          <div style={{ background: 'var(--violet-50)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{baby.gender === 'menino' ? '👦' : baby.gender === 'menina' ? '👧' : '🎁'}</span>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--accent)', margin: 0 }}>{baby.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
                {baby.status === 'gestacao' ? `Gestação${baby.week ? ` — semana ${baby.week}` : ''}` : 'Já nasceu 🎉'}
              </p>
            </div>
          </div>
        )}

        {/* About textarea */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>
            Sobre {baby?.name || 'o bebê'} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span>
          </label>
          <textarea
            rows={4}
            value={about}
            onChange={e => setAbout(e.target.value)}
            placeholder={`Conte um pouco sobre ${baby?.name || 'o bebê'}, o que vocês estão sentindo, os planos...`}
            style={{ width: '100%', padding: '13px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 14, fontSize: 15, resize: 'none', fontFamily: 'var(--font-body)', color: 'var(--text-strong)', background: '#fff' }}
          />
        </div>

        {error && (
          <div style={{ background: 'var(--rose-100)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--font-body)', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ flex: 1 }} />
        <Button fullWidth onClick={handleStart} loading={loading} size="lg">
          Começar jornada 💜
        </Button>
      </div>
    </div>
  )
}
