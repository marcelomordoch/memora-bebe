'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { calculateCurrentWeek } from '@/lib/utils'

export default function CriarBebeStep2() {
  const router = useRouter()
  const { baby, setBaby } = useApp()
  const [status, setStatus] = useState<'gestacao' | 'nascido'>('gestacao')
  const [dueDate, setDueDate] = useState('')
  const [birthDate, setBirthDate] = useState('')

  function handleNext() {
    const weekFromDate = dueDate ? calculateCurrentWeek({ due_date: dueDate }) : undefined
    const prev = JSON.parse(sessionStorage.getItem('wizard_baby') || '{}')
    const wizardData = {
      ...prev,
      status,
      due_date: status === 'gestacao' ? (dueDate || undefined) : undefined,
      birth_date: status === 'nascido' ? (birthDate || undefined) : undefined,
      week: status === 'gestacao' ? weekFromDate : undefined,
    }
    sessionStorage.setItem('wizard_baby', JSON.stringify(wizardData))
    setBaby({ id: '', user_id: baby?.user_id || '', created_at: new Date().toISOString(), ...wizardData })
    router.push('/criar-bebe/passo-3')
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
            <div key={i} style={{ height: 8, borderRadius: 999, width: i === 1 ? 24 : 8, background: i <= 1 ? '#fff' : 'rgba(255,255,255,.35)', transition: 'width .3s ease' }} />
          ))}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 4 }}>Data e Status</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)' }}>
          {baby?.name} já nasceu ou ainda está chegando?
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -28, flex: 1, padding: '28px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Segmented control */}
        <div style={{ background: 'var(--surface-sunken)', padding: 4, borderRadius: 999, display: 'flex' }}>
          {[
            { value: 'gestacao', label: '🤰 Em gestação' },
            { value: 'nascido', label: '🎉 Já nasceu' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value as any)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: status === opt.value ? '#fff' : 'transparent',
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
                color: status === opt.value ? 'var(--text-strong)' : 'var(--text-muted)',
                boxShadow: status === opt.value ? 'var(--shadow-sm)' : 'none',
                transition: 'all 140ms ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {status === 'gestacao' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>
                Data prevista do parto
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '13px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 14, fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-strong)', background: '#fff' }}
              />
            </div>

            {dueDate && (
              <div style={{ background: 'var(--violet-50)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🗓️</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--accent)', margin: 0 }}>
                    Semana {calculateCurrentWeek({ due_date: dueDate })}ª da gestação
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, marginTop: 2 }}>
                    Calculado automaticamente a partir da DPP
                  </p>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 8 }}>
                Data de nascimento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                style={{ width: '100%', padding: '13px 14px', border: '1.5px solid var(--border-strong)', borderRadius: 14, fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--text-strong)', background: '#fff' }}
              />
            </div>
            {birthDate && (
              <div style={{ background: 'var(--rose-100)', borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>🎉</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--rose-500)' }}>Que alegria!</p>
                  <p style={{ fontSize: 13, color: 'var(--rose-500)', fontFamily: 'var(--font-body)' }}>{baby?.name} já está no mundo! 💜</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />
        <Button fullWidth onClick={handleNext} size="lg">Próximo →</Button>
      </div>
    </div>
  )
}
