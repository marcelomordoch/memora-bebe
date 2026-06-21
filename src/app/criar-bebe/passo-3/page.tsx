'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { createBaby } from '@/lib/supabase/queries'

export default function CriarBebeStep3() {
  const router = useRouter()
  const { baby, setBaby, user } = useApp()
  const [about, setAbout] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    if (!user?.id) return
    setLoading(true)
    setError('')

    try {
      // Salvar bebê no Supabase — não passar id (Supabase gera automaticamente)
      const payload: Record<string, unknown> = {
        user_id: user.id,
        name: baby!.name,
        gender: baby!.gender,
        status: baby!.status,
        about: about.trim() || null,
      }
      // Só incluir datas se existirem (evitar empty string como date)
      if (baby!.due_date) payload.due_date = baby!.due_date
      if (baby!.birth_date) payload.birth_date = baby!.birth_date
      if (baby!.week) payload.week = baby!.week

      const saved = await createBaby(payload as Parameters<typeof createBaby>[0])
      setBaby(saved)
      router.push('/onboarding')
    } catch (err: unknown) {
      console.error('[passo-3] createBaby error:', err)
      const msg = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Erro ao salvar. Tente novamente.'
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
            <div key={i} style={{ height: 8, borderRadius: 999, width: 24, background: '#fff', transition: 'width .3s ease' }} />
          ))}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 4 }}>Foto e Apresentação</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>Quase lá! Esses detalhes são opcionais.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -28, flex: 1, padding: '28px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
        {/* Photo uploader */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setHasPhoto(v => !v)}
            style={{
              width: 120, height: 120, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: hasPhoto ? 'var(--gradient-brand)' : 'var(--violet-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              outline: hasPhoto ? 'none' : '2.5px dashed var(--accent)', outlineOffset: 3,
              fontSize: hasPhoto ? 48 : undefined,
            }}
          >
            {hasPhoto ? '👶' : <Icon name="camera" size={32} color="var(--accent)" />}
            <div style={{ position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
              <Icon name="plus" size={14} color="#fff" strokeWidth={2.5} />
            </div>
          </button>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
            {hasPhoto ? 'Toque para mudar a foto.' : 'Adicionar foto (opcional)'}
          </p>
        </div>

        {/* About textarea */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>
            Sobre {baby?.name || 'o bebê'}
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
          <p style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>{error}</p>
        )}

        <div style={{ flex: 1 }} />
        <Button fullWidth onClick={handleStart} loading={loading} size="lg">
          Começar jornada 💜
        </Button>
      </div>
    </div>
  )
}
