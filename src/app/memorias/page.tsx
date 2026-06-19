'use client'

import { useState } from 'react'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { MOCK_MEMORIES } from '@/lib/mock-data'
import { formatDate, formatShortDate } from '@/lib/utils'
import type { Memory } from '@/types'

// ─── Filter chips ────────────────────────────────────────────────────────────

const FILTERS = [
  { label: 'Todas',     value: 'all' },
  { label: 'Gestação',  value: 'gestacao' },
  { label: '0–1 ano',   value: '0-1' },
  { label: '1–3 anos',  value: '1-3' },
  { label: 'Escola',    value: 'escola' },
]

// ─── ImageViewer overlay ─────────────────────────────────────────────────────

function ImageViewer({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  const [liked, setLiked] = useState(memory.liked_by_me)
  const [count, setCount] = useState(memory.likes_count)

  function toggleLike() {
    setLiked(prev => {
      setCount(c => prev ? c - 1 : c + 1)
      return !prev
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(18,17,26,.95)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onClose}
    >
      {/* Top – colored hero */}
      <div
        style={{
          height: '56%',
          background: memory.bg_color,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ fontSize: 88 }}>{memory.emoji}</span>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.12)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={20} color="#fff" strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom – white sheet */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          padding: '12px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)' }} />
        </div>

        {/* Date */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          {formatDate(memory.created_at)}
        </p>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            color: 'var(--text-strong)',
            margin: 0,
          }}
        >
          {memory.title}
        </h2>

        {/* Body */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-body)',
            margin: 0,
            flex: 1,
          }}
        >
          {memory.body}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={toggleLike}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px 0',
              borderRadius: 14,
              background: 'var(--surface-sunken)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              color: liked ? 'var(--rose-500)' : 'var(--text-body)',
            }}
          >
            <Icon
              name="heart"
              size={18}
              color={liked ? 'var(--rose-500)' : 'var(--text-body)'}
              strokeWidth={liked ? 0 : 2}
            />
            Curtir{count > 0 ? ` (${count})` : ''}
          </button>

          <button
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px 0',
              borderRadius: 14,
              background: 'var(--surface-sunken)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--text-body)',
            }}
          >
            <Icon name="share-2" size={18} color="var(--text-body)" strokeWidth={2} />
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Memory card ─────────────────────────────────────────────────────────────

function MemoryCard({ memory, onOpen }: { memory: Memory; onOpen: () => void }) {
  const [liked, setLiked] = useState(memory.liked_by_me)
  const [count, setCount] = useState(memory.likes_count)

  function toggleLike(e: React.MouseEvent) {
    e.stopPropagation()
    setLiked(prev => {
      setCount(c => prev ? c - 1 : c + 1)
      return !prev
    })
  }

  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--surface-card)',
        borderRadius: 18,
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* Left – colored hero */}
      <div
        style={{
          width: 100,
          flexShrink: 0,
          background: memory.bg_color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 40 }}>{memory.emoji}</span>
      </div>

      {/* Right – content */}
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, position: 'relative' }}>
        {/* Heart button */}
        <button
          onClick={toggleLike}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'transparent',
            border: liked ? 'none' : '1.5px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Icon
            name="heart"
            size={16}
            color={liked ? '#C76FB0' : 'var(--border-strong)'}
            strokeWidth={liked ? 0 : 2}
          />
        </button>

        {/* Title */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-strong)',
            margin: 0,
            paddingRight: 40,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {memory.title}
        </p>

        {/* Date */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
          {formatShortDate(memory.created_at)}
        </p>

        {/* Body preview */}
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-body)',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {memory.body}
        </p>

        {/* Footer */}
        <div
          style={{
            marginTop: 6,
            paddingTop: 8,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="heart" size={12} color="var(--rose-500)" strokeWidth={0} />
            {count} curtidas
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-accent)',
            }}
          >
            Ver memória
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MemoriasPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selected, setSelected] = useState<Memory | null>(null)

  const filtered = activeFilter === 'all'
    ? MOCK_MEMORIES
    : MOCK_MEMORIES.filter(m => m.life_stage === activeFilter)

  return (
    <>
      <StatusBar />

      {/* Screen */}
      <div style={{ background: 'var(--surface-page)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div
          style={{
            padding: '20px 20px 0',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 26,
              color: 'var(--text-strong)',
              margin: 0,
            }}
          >
            Memórias
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {MOCK_MEMORIES.length} memórias registradas
          </p>
        </div>

        {/* Filter chips */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '16px 20px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            flexShrink: 0,
          }}
        >
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 13,
                background: activeFilter === f.value ? 'var(--accent)' : 'var(--surface-card)',
                color: activeFilter === f.value ? '#fff' : 'var(--text-body)',
                boxShadow: activeFilter === f.value ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
                transition: 'all .18s ease',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Memory list */}
        <div style={{ flex: 1, padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: '60px 0',
                color: 'var(--text-muted)',
              }}
            >
              <Icon name="inbox" size={48} color="var(--border-strong)" strokeWidth={1.5} />
              <p style={{ fontSize: 15, margin: 0 }}>Nenhuma memória encontrada</p>
            </div>
          ) : (
            filtered.map(m => (
              <MemoryCard key={m.id} memory={m} onOpen={() => setSelected(m)} />
            ))
          )}
        </div>
      </div>

      {/* ImageViewer overlay */}
      {selected && <ImageViewer memory={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
