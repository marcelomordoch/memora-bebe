'use client'

import { useState, useEffect, useCallback } from 'react'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { getMemories, toggleLike, deleteMemory } from '@/lib/supabase/queries'
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

function ImageViewer({
  memory,
  onClose,
  onToggleLike,
  onDelete,
  isOwner,
}: {
  memory: Memory
  onClose: () => void
  onToggleLike: (id: string) => void
  onDelete: (id: string) => void
  isOwner: boolean
}) {
  const liked = memory.liked_by_me
  const count = memory.likes_count
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Navegação de múltiplas fotos
  const allUrls = memory.media_urls?.length ? memory.media_urls : memory.media_url ? [memory.media_url] : []
  const [photoIndex, setPhotoIndex] = useState(0)
  const currentUrl = allUrls[photoIndex] || null

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
      {/* Top – imagem ou hero colorido */}
      <div
        style={{
          height: '56%',
          background: memory.bg_color || 'var(--gradient-brand)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {memory.type === 'audio' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.18)' }}>
            <Icon name="mic" size={56} color="#fff" strokeWidth={1.5} />
          </div>
        ) : currentUrl ? (
          <img src={currentUrl} alt={memory.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
        ) : (
          <span style={{ fontSize: 88 }}>{memory.emoji || '💜'}</span>
        )}

        {/* Setas de navegação (múltiplas fotos) */}
        {allUrls.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); setPhotoIndex(i => Math.max(0, i - 1)) }} disabled={photoIndex === 0} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: photoIndex === 0 ? 0.3 : 1 }}>
              <Icon name="chevron-left" size={20} color="#fff" strokeWidth={2.5} />
            </button>
            <button onClick={e => { e.stopPropagation(); setPhotoIndex(i => Math.min(allUrls.length - 1, i + 1)) }} disabled={photoIndex === allUrls.length - 1} style={{ position: 'absolute', right: 52, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: photoIndex === allUrls.length - 1 ? 0.3 : 1 }}>
              <Icon name="chevron-right" size={20} color="#fff" strokeWidth={2.5} />
            </button>
            {/* Dots indicator */}
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
              {allUrls.map((_, i) => (
                <div key={i} onClick={e => { e.stopPropagation(); setPhotoIndex(i) }} style={{ width: i === photoIndex ? 16 : 6, height: 6, borderRadius: 999, background: '#fff', opacity: i === photoIndex ? 1 : 0.5, cursor: 'pointer', transition: 'width 200ms' }} />
              ))}
            </div>
          </>
        )}

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

        {/* Botão excluir — só para o dono */}
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
            style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(197,107,107,.85)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Icon name="trash" size={18} color="#fff" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(18,17,26,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }} onClick={() => setConfirmDelete(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 360, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-strong)', margin: '0 0 8px' }}>Excluir memória?</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '0 0 20px' }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', background: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { onDelete(memory.id); onClose() }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--danger)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}

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

        {/* Audio player */}
        {memory.type === 'audio' && memory.media_url && (
          <audio controls src={memory.media_url} style={{ width: '100%', height: 40 }} />
        )}

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
            onClick={() => onToggleLike(memory.id)}
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

function MemoryCard({
  memory,
  onOpen,
  onToggleLike,
}: {
  memory: Memory
  onOpen: () => void
  onToggleLike: (id: string) => void
}) {
  const liked = memory.liked_by_me
  const count = memory.likes_count

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    onToggleLike(memory.id)
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
        flexDirection: (memory.media_url && memory.type !== 'audio') ? 'column' : 'row',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {memory.media_url && memory.type !== 'audio' ? (
        /* ── Layout vertical quando tem foto ── */
        <>
          {/* Foto por inteira, sem corte */}
          <div style={{ width: '100%', background: memory.bg_color || '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, maxHeight: 320, overflow: 'hidden' }}>
            <img
              src={memory.media_url}
              alt={memory.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', maxHeight: 320 }}
            />
          </div>
          {/* Texto abaixo — 3 linhas + scroll */}
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            <button onClick={handleLike} style={{ position: 'absolute', top: 10, right: 12, width: 30, height: 30, borderRadius: '50%', background: 'transparent', border: liked ? 'none' : '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={15} color={liked ? '#C76FB0' : 'var(--border-strong)'} strokeWidth={liked ? 0 : 2} />
            </button>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', margin: 0, paddingRight: 36, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{memory.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{formatShortDate(memory.created_at)}</p>
            {memory.body && (
              <p style={{ fontSize: 13, color: 'var(--text-body)', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowY: 'auto', maxHeight: 60 }}>{memory.body}</p>
            )}
          </div>
        </>
      ) : (
        /* ── Layout horizontal quando só tem emoji/texto ── */
        <>
          <div style={{ width: 100, flexShrink: 0, background: memory.bg_color || 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {memory.type === 'audio' ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 32 }}>
                {[10, 22, 14, 28, 16, 24, 12].map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: 'rgba(255,255,255,.9)' }} />
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 40 }}>{memory.emoji || '💜'}</span>
            )}
          </div>
          <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, position: 'relative' }}>
            <button onClick={handleLike} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'transparent', border: liked ? 'none' : '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={16} color={liked ? '#C76FB0' : 'var(--border-strong)'} strokeWidth={liked ? 0 : 2} />
            </button>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', margin: 0, paddingRight: 40, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{memory.title}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{formatShortDate(memory.created_at)}</p>
            <p style={{ fontSize: 13, color: 'var(--text-body)', margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{memory.body}</p>
            {/* Footer */}
            <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="heart" size={12} color="var(--rose-500)" strokeWidth={0} />
                {count} curtida{count !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-accent)' }}>Ver memória</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MemoriasPage() {
  const { baby, user } = useApp()
  const [activeFilter, setActiveFilter] = useState('all')
  const [allMemories, setAllMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Memory | null>(null)

  // Fetch all memories once when baby loads
  const fetchMemories = useCallback(async () => {
    if (!baby?.id) return
    setLoading(true)
    try {
      const mems = await getMemories(baby.id)
      setAllMemories(mems)
    } finally {
      setLoading(false)
    }
  }, [baby?.id])

  useEffect(() => {
    fetchMemories()
  }, [fetchMemories])

  // Client-side filter
  const filtered = activeFilter === 'all'
    ? allMemories
    : allMemories.filter(m => m.life_stage === activeFilter)

  // Toggle like — optimistic update then sync with DB
  async function handleToggleLike(memoryId: string) {
    if (!user?.id) return

    // Optimistic update
    setAllMemories(prev => prev.map(m => {
      if (m.id !== memoryId) return m
      const nowLiked = !m.liked_by_me
      return {
        ...m,
        liked_by_me: nowLiked,
        likes_count: nowLiked ? m.likes_count + 1 : Math.max(0, m.likes_count - 1),
      }
    }))

    // Also update selected overlay if open
    setSelected(prev => {
      if (!prev || prev.id !== memoryId) return prev
      const nowLiked = !prev.liked_by_me
      return {
        ...prev,
        liked_by_me: nowLiked,
        likes_count: nowLiked ? prev.likes_count + 1 : Math.max(0, prev.likes_count - 1),
      }
    })

    // Sync with Supabase (fire and forget; revert not shown for UX simplicity)
    try {
      await toggleLike(memoryId, user.id)
    } catch {
      // Revert optimistic update on failure
      setAllMemories(prev => prev.map(m => {
        if (m.id !== memoryId) return m
        const revert = !m.liked_by_me
        return { ...m, liked_by_me: revert, likes_count: revert ? m.likes_count + 1 : Math.max(0, m.likes_count - 1) }
      }))
    }
  }

  return (
    <>
      <StatusBar />

      {/* Screen */}
      <div style={{ background: 'var(--surface-page)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 0' }}>
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
            {loading ? 'Carregando...' : `${allMemories.length} memória${allMemories.length !== 1 ? 's' : ''} registrada${allMemories.length !== 1 ? 's' : ''}`}
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
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <span style={{
                width: 36, height: 36, border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--accent)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', display: 'inline-block',
              }} />
            </div>
          ) : filtered.length === 0 ? (
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
                textAlign: 'center',
              }}
            >
              <Icon name="inbox" size={48} color="var(--border-strong)" strokeWidth={1.5} />
              <p style={{ fontSize: 15, margin: 0 }}>
                {allMemories.length === 0
                  ? 'Nenhuma memória encontrada. Toque em + para criar a primeira! 💜'
                  : 'Nenhuma memória nesta categoria.'}
              </p>
            </div>
          ) : (
            filtered.map(m => (
              <MemoryCard
                key={m.id}
                memory={m}
                onOpen={() => setSelected(m)}
                onToggleLike={handleToggleLike}
              />
            ))
          )}
        </div>
      </div>

      {/* ImageViewer overlay */}
      {selected && (
        <ImageViewer
          memory={selected}
          onClose={() => setSelected(null)}
          onToggleLike={handleToggleLike}
          isOwner={selected.user_id === user?.id}
          onDelete={async (id) => {
            try {
              await deleteMemory(id)
              setAllMemories(prev => prev.filter(m => m.id !== id))
            } catch (e) { console.error(e) }
          }}
        />
      )}
    </>
  )
}
