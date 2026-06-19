'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { MOCK_FUTURE_MESSAGES } from '@/lib/mock-data'

const ageOptions = [
  { label: 'Aos 5 anos', value: 5 },
  { label: 'Aos 10 anos', value: 10 },
  { label: 'Aos 18 anos', value: 18 },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function MensagensPage() {
  const router = useRouter()
  const [selectedAge, setSelectedAge] = useState(5)

  const filtered = MOCK_FUTURE_MESSAGES.filter((m) => m.open_at_age === selectedAge)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', fontFamily: 'var(--font-body)', paddingBottom: 100 }}>
      <StatusBar />
      <ScreenHeader title="Mensagens para o Futuro" onBack={() => router.back()} />

      {/* Age Selector Chips */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 20px 20px', overflowX: 'auto' }}>
        {ageOptions.map((opt) => {
          const active = selectedAge === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setSelectedAge(opt.value)}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 16px',
                borderRadius: 99,
                border: active ? 'none' : '1.5px solid var(--border-subtle)',
                background: active ? 'var(--accent)' : 'var(--surface-card)',
                color: active ? '#fff' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: active ? 'var(--shadow-accent)' : 'none',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Messages */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '40px 0' }}>
            Nenhuma mensagem para esta idade ainda.
          </div>
        )}
        {filtered.map((msg) => (
          <div
            key={msg.id}
            style={{
              background: 'var(--surface-card)',
              borderRadius: 16,
              padding: '16px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  background: 'linear-gradient(135deg,#B79BD8,#6B53AE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                MM
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-strong)' }}>Mamãe</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div
                style={{
                  padding: '3px 10px',
                  borderRadius: 99,
                  background: 'var(--violet-100)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--accent)',
                }}
              >
                Aos {msg.open_at_age} anos
              </div>
            </div>

            {/* Title */}
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-strong)', marginBottom: 8 }}>{msg.title}</div>

            {/* Body */}
            <p style={{ fontSize: 14, color: 'var(--text-body)', margin: 0, lineHeight: 1.6 }}>{msg.body}</p>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div style={{ padding: '24px 20px 32px' }}>
        <button
          style={{
            width: '100%',
            padding: '15px',
            border: 'none',
            borderRadius: 16,
            background: 'var(--gradient-brand)',
            boxShadow: 'var(--shadow-accent)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          + Criar nova mensagem
        </button>
      </div>
    </div>
  )
}
