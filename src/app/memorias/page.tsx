'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { getMemories, toggleLike, deleteMemory, updateMemory } from '@/lib/supabase/queries'
import { uploadToR2 } from '@/lib/r2/upload'
import { compressImage } from '@/lib/r2/compress'
import { formatDate, formatShortDate, getLifeStage, lifeStageLabel, babyAgeAtMemory } from '@/lib/utils'
import { useSignedUrl } from '@/hooks/useSignedUrl'
import type { Memory } from '@/types'

// ─── Edit sheet ──────────────────────────────────────────────────────────────

function EditMemorySheet({
  memory,
  onClose,
  onSaved,
}: {
  memory: Memory
  onClose: () => void
  onSaved: (updated: Partial<Memory>) => void
}) {
  const [title, setTitle] = useState(memory.title)
  const [body, setBody] = useState(memory.body || '')
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const currentMediaUrl = memory.media_url

  async function handleSave() {
    if (!title.trim()) { setError('O título não pode estar vazio.'); return }
    setSaving(true)
    setError('')
    try {
      let media_url = currentMediaUrl
      let fileSizeBytes: number | undefined
      if (newPhotoFile) {
        const compressed = await compressImage(newPhotoFile)
        const result = await uploadToR2(compressed, 'memories')
        media_url = result.url
        fileSizeBytes = result.sizeBytes
      }
      const patch: { title: string; body: string; media_url?: string; file_size_bytes?: number } = { title: title.trim(), body }
      if (newPhotoFile) { patch.media_url = media_url; patch.file_size_bytes = fileSizeBytes }
      await updateMemory(memory.id, patch)
      onSaved(patch)
      onClose()
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setNewPhotoFile(file)
    setNewPhotoPreview(URL.createObjectURL(file))
  }

  const hasPhoto = memory.type === 'foto' || (memory.type !== 'audio' && memory.type !== 'video' && !!currentMediaUrl)
  const previewSrc = newPhotoPreview || null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(18,17,26,.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '24px 24px 0 0', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '90dvh', overflowY: 'auto' }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--border-strong)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-strong)', margin: 0 }}>Editar memória</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Icon name="x" size={22} color="var(--text-muted)" strokeWidth={2} />
          </button>
        </div>

        {/* Título */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 6 }}>Título</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border-strong)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-strong)', background: '#fff', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        {/* Texto */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 6 }}>Texto</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border-strong)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-strong)', background: '#fff', boxSizing: 'border-box', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
          />
        </div>

        {/* Foto (só se a memória é do tipo foto) */}
        {(hasPhoto || memory.type === 'foto') && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 6 }}>Foto</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            {previewSrc ? (
              <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: 14, overflow: 'hidden', background: '#000' }}>
                <img src={previewSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => { setNewPhotoFile(null); setNewPhotoPreview(null) }} style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x" size={14} color="#fff" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{ width: '100%', padding: '14px', borderRadius: 14, border: '2px dashed var(--border-strong)', background: 'var(--violet-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--accent)' }}
              >
                <Icon name="camera" size={18} color="var(--accent)" />
                Trocar foto
              </button>
            )}
          </div>
        )}

        {error && <p style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--font-body)', textAlign: 'center', margin: 0 }}>{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'var(--gradient-brand)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.8 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: 'var(--shadow-accent)' }}
        >
          {saving ? (
            <><span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Salvando...</>
          ) : '✓ Salvar alterações'}
        </button>
      </div>
    </div>
  )
}

// ─── ImageViewer overlay ─────────────────────────────────────────────────────

function ImageViewer({
  memory,
  birthDate,
  onClose,
  onToggleLike,
  onDelete,
  onEdit,
  isOwner,
}: {
  memory: Memory
  birthDate: string | undefined
  onClose: () => void
  onToggleLike: (id: string) => void
  onDelete: (id: string) => void
  onEdit: () => void
  isOwner: boolean
}) {
  const ageLabel = babyAgeAtMemory(memory.created_at, birthDate)
  const liked = memory.liked_by_me
  const count = memory.likes_count
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Navegação de múltiplas fotos
  const allUrls = memory.media_urls?.length ? memory.media_urls : memory.media_url ? [memory.media_url] : []
  const [photoIndex, setPhotoIndex] = useState(0)
  const currentUrl = allUrls[photoIndex] || null
  const signedCurrentUrl = useSignedUrl(currentUrl)
  const signedAudioUrl = useSignedUrl(memory.type === 'audio' ? memory.media_url : null)

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
          flex: 1,
          minHeight: '28%',
          background: memory.bg_color || 'var(--gradient-brand)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {memory.type === 'audio' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.18)' }}>
            <Icon name="mic" size={56} color="#fff" strokeWidth={1.5} />
          </div>
        ) : memory.type === 'video' && signedCurrentUrl ? (
          <video src={signedCurrentUrl} controls playsInline style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
        ) : signedCurrentUrl ? (
          <img src={signedCurrentUrl} alt={memory.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
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

      {/* Bottom – white sheet: auto-sizes to content, scrolls when long */}
      <div
        style={{
          flexShrink: 0,
          maxHeight: '72%',
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

        {/* Date + age */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{formatDate(memory.created_at)}</p>
          {ageLabel && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--violet-50)', borderRadius: 999, padding: '2px 9px' }}>{ageLabel}</span>}
        </div>

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
        {memory.type === 'audio' && signedAudioUrl && (
          <audio controls src={signedAudioUrl} style={{ width: '100%', height: 40 }} />
        )}

        {/* Body */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-body)',
            margin: 0,
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

          {isOwner && (
            <button
              onClick={onEdit}
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
              <Icon name="edit" size={18} color="var(--text-body)" strokeWidth={2} />
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Memory card ─────────────────────────────────────────────────────────────

function MemoryCard({
  memory,
  birthDate,
  onOpen,
  onToggleLike,
}: {
  memory: Memory
  birthDate: string | undefined
  onOpen: () => void
  onToggleLike: (id: string) => void
}) {
  const liked = memory.liked_by_me
  const count = memory.likes_count
  const signedMediaUrl = useSignedUrl(memory.media_url)
  const ageLabel = babyAgeAtMemory(memory.created_at, birthDate)

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
          {/* Foto ou vídeo por inteiro, sem corte */}
          <div style={{ width: '100%', background: memory.bg_color || '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, maxHeight: 320, overflow: 'hidden', position: 'relative' }}>
            {memory.type === 'video' ? (
              <>
                <video
                  src={signedMediaUrl ? `${signedMediaUrl}#t=0.1` : undefined}
                  muted
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={e => { try { e.currentTarget.currentTime = 0.1 } catch {} }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', maxHeight: 320, background: '#000' }}
                />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <Icon name="play" size={26} color="#fff" strokeWidth={1.5} />
                </div>
              </>
            ) : (
              <img
                src={signedMediaUrl}
                alt={memory.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', maxHeight: 320 }}
              />
            )}
          </div>
          {/* Texto abaixo — 3 linhas + scroll */}
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            <button onClick={handleLike} style={{ position: 'absolute', top: 10, right: 12, width: 30, height: 30, borderRadius: '50%', background: 'transparent', border: liked ? 'none' : '1.5px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={15} color={liked ? '#C76FB0' : 'var(--border-strong)'} strokeWidth={liked ? 0 : 2} />
            </button>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-strong)', margin: 0, paddingRight: 36, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{memory.title}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{formatShortDate(memory.created_at)}</p>
              {ageLabel && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--violet-50)', borderRadius: 999, padding: '1px 7px' }}>{ageLabel}</span>}
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{formatShortDate(memory.created_at)}</p>
              {ageLabel && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', background: 'var(--violet-50)', borderRadius: 999, padding: '1px 7px' }}>{ageLabel}</span>}
            </div>
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
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [allMemories, setAllMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Memory | null>(null)
  const [editing, setEditing] = useState(false)

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

  // Compute life stage for every memory based on birth_date
  const memoriesWithStage = allMemories.map(m => ({
    ...m,
    _stage: getLifeStage(m.created_at, baby?.birth_date),
  }))

  // Build dynamic filter list from stages that actually have memories,
  // sorted chronologically: gestacao first, then ano-1, ano-2, ...
  const stagesPresent = Array.from(new Set(memoriesWithStage.map(m => m._stage)))
    .sort((a, b) => {
      if (a === 'gestacao') return -1
      if (b === 'gestacao') return 1
      return parseInt(a.slice(4)) - parseInt(b.slice(4))
    })

  const FILTERS = [
    { label: 'Todas', value: 'all' },
    ...stagesPresent.map(s => ({ label: lifeStageLabel(s), value: s })),
  ]

  // Client-side filter: stage + keyword search
  const q = search.trim().toLowerCase()
  const filtered = memoriesWithStage
    .filter(m => activeFilter === 'all' || m._stage === activeFilter)
    .filter(m => !q || m.title.toLowerCase().includes(q) || (m.body || '').toLowerCase().includes(q))

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

          {/* Search bar */}
          <div style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: searchFocused ? '#fff' : 'var(--surface-card)',
            border: `1.5px solid ${searchFocused ? 'var(--accent)' : 'var(--border-subtle)'}`,
            borderRadius: 14,
            padding: '0 14px',
            boxShadow: searchFocused ? '0 0 0 3px rgba(107,83,174,0.12)' : 'var(--shadow-sm)',
            transition: 'border-color .15s, box-shadow .15s',
          }}>
            <Icon name="search" size={17} color={searchFocused ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Buscar por palavra-chave..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--text-strong)',
                padding: '12px 0',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
              >
                <Icon name="x" size={15} color="var(--text-muted)" strokeWidth={2.5} />
              </button>
            )}
          </div>
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
                  : q
                    ? `Nenhuma memória encontrada para "${search}".`
                    : 'Nenhuma memória nesta categoria.'}
              </p>
            </div>
          ) : (
            filtered.map(m => (
              <MemoryCard
                key={m.id}
                memory={m}
                birthDate={baby?.birth_date}
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
          birthDate={baby?.birth_date}
          onClose={() => setSelected(null)}
          onToggleLike={handleToggleLike}
          onEdit={() => setEditing(true)}
          isOwner={selected.user_id === user?.id}
          onDelete={async (id) => {
            try {
              await deleteMemory(id)
              setAllMemories(prev => prev.filter(m => m.id !== id))
            } catch (e) { console.error(e) }
          }}
        />
      )}

      {/* Edit sheet */}
      {selected && editing && (
        <EditMemorySheet
          memory={selected}
          onClose={() => setEditing(false)}
          onSaved={(patch) => {
            setAllMemories(prev => prev.map(m => m.id === selected.id ? { ...m, ...patch } : m))
            setSelected(prev => prev ? { ...prev, ...patch } : prev)
          }}
        />
      )}
    </>
  )
}
