'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'

const GENDERS = [
  { value: 'menino', label: 'Menino', emoji: '👦' },
  { value: 'menina', label: 'Menina', emoji: '👧' },
  { value: 'surpresa', label: 'Surpresa', emoji: '🎁' },
] as const

export default function CriarBebeStep1() {
  const router = useRouter()
  const { setBaby, user } = useApp()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'menino' | 'menina' | 'surpresa'>('menina')

  function handleNext() {
    // Armazena temporariamente no contexto — será salvo no Supabase no passo 3
    setBaby({
      id: '',
      user_id: user?.id || '',
      name: name.trim(),
      gender,
      status: 'gestacao',
      created_at: new Date().toISOString(),
    })
    router.push('/criar-bebe/passo-2')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--gradient-brand)', padding: '16px 20px 56px', position: 'relative' }}>
        <StatusBar light />
        <button onClick={() => router.back()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon name="chevron-left" color="#fff" />
        </button>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ height: 8, borderRadius: 999, width: i === 0 ? 24 : 8, background: i === 0 ? '#fff' : 'rgba(255,255,255,.35)', transition: 'width .3s ease' }} />
          ))}
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 4 }}>Nome e Gênero</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>Como vamos chamar o/a novo(a) integrante?</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -28, flex: 1, padding: '28px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>Nome do bebê</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Sofia, Miguel..."
            style={{ width: '100%', padding: '13px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 14, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-strong)', textAlign: 'center', background: '#fff' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 12 }}>Gênero</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {GENDERS.map(g => (
              <button key={g.value} onClick={() => setGender(g.value)} style={{ padding: '16px 8px', borderRadius: 14, border: '2px solid', borderColor: gender === g.value ? 'var(--accent)' : 'var(--border-subtle)', background: gender === g.value ? 'var(--violet-50)' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 140ms ease' }}>
                <span style={{ fontSize: 32 }}>{g.emoji}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: gender === g.value ? 'var(--accent)' : 'var(--text-muted)' }}>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <Button fullWidth disabled={!name.trim()} onClick={handleNext} size="lg">Próximo →</Button>
      </div>
    </div>
  )
}
