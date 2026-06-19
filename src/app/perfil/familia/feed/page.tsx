'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'

export default function FamiliaFeedPage() {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-page)', fontFamily: 'var(--font-body)', paddingBottom: 100 }}>
      <StatusBar />
      <ScreenHeader title="Feed da Família" onBack={() => router.back()} />

      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Post Card */}
        <div style={{ background: 'var(--surface-card)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          {/* Media Area */}
          <div
            style={{
              height: 180,
              background: 'linear-gradient(135deg,#B79BD8 0%,#6B53AE 55%,#4E4490 100%)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
            }}
          >
            🤰
            {/* Week badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 14,
                background: 'rgba(107,83,174,0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: 99,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              24ª semana
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-body)', margin: '0 0 14px', lineHeight: 1.6 }}>
              Que dia especial! Sentimos o primeiro chute juntos hoje! 💜
            </p>

            {/* Reaction Row */}
            <div style={{ display: 'flex', gap: 18, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              {[
                { icon: 'heart', count: liked ? 13 : 12, action: () => setLiked(!liked), active: liked },
                { icon: 'message-circle', count: 2, action: () => {}, active: false },
                { icon: 'mic', count: 1, action: () => {}, active: false },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 13,
                    fontWeight: 500,
                    color: btn.active ? 'var(--rose-500)' : 'var(--text-muted)',
                  }}
                >
                  <Icon name={btn.icon} size={18} color={btn.active ? 'var(--rose-500)' : 'var(--text-muted)'} />
                  {btn.count}
                </button>
              ))}
            </div>

            {/* Comments */}
            <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { initials: 'AP', name: 'Ana Paula', date: 'há 1h', text: 'Que emoção! Eu estava aqui esperando ela se mexer! 😍' },
                { initials: 'VM', name: 'Vó Maria', date: 'há 30min', text: 'Que benção! Essa netinha já é muito amada 💕' },
              ].map((c) => (
                <div key={c.name} style={{ display: 'flex', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      background: 'linear-gradient(135deg,#B79BD8,#6B53AE)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {c.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-strong)' }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.date}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 20px 28px',
          background: 'var(--surface-page)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface-card)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '10px 14px',
          }}
        >
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escreva um comentário..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--text-body)',
              outline: 'none',
            }}
          />
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="mic" size={20} color="var(--accent)" />
          </button>
        </div>
      </div>
    </div>
  )
}
