'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'

export default function CriarBebeStep2() {
  const router = useRouter()
  const { baby, setBaby } = useApp()
  const [status, setStatus] = useState<'gestacao' | 'nascido'>('gestacao')
  const [dueDate, setDueDate] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [week, setWeek] = useState(20)

  function handleNext() {
    setBaby({
      ...baby!,
      status,
      due_date: status === 'gestacao' ? dueDate : undefined,
      birth_date: status === 'nascido' ? birthDate : undefined,
      week: status === 'gestacao' ? week : undefined,
    })
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

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 12 }}>
                Semana da gestação
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <button onClick={() => setWeek(w => Math.max(1, w - 1))} style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border-strong)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="chevron-left" />
                </button>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, color: 'var(--accent)', minWidth: 60, textAlign: 'center' }}>
                  {week}ª
                </span>
                <button onClick={() => setWeek(w => Math.min(42, w + 1))} style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border-strong)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="chevron-right" />
                </button>
              </div>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>semana da gestação (1–42)</p>
            </div>
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
