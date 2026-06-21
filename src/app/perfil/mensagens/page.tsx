'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useApp } from '@/contexts/AppContext'
import { getFutureMessages, createFutureMessage, unlockAchievement } from '@/lib/supabase/queries'
import type { FutureMessage } from '@/types'

const ageOptions = [
  { label: 'Aos 5 anos', value: 5 },
  { label: 'Aos 10 anos', value: 10 },
  { label: 'Aos 18 anos', value: 18 },
]

export default function MensagensPage() {
  const router = useRouter()
  const { user, baby } = useApp()
  const [selectedAge, setSelectedAge] = useState(5)
  const [messages, setMessages] = useState<FutureMessage[]>([])
  const [loading, setLoading] = useState(true)

  // Create form state
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [formAge, setFormAge] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!baby?.id) return
    getFutureMessages(baby.id)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [baby?.id])

  const filtered = messages.filter((m) => m.open_at_age === selectedAge)

  async function handleCreate() {
    if (!baby?.id || !user?.id) return
    if (!formTitle.trim() || !formBody.trim()) { setFormError('Preencha o título e a mensagem.'); return }
    setSubmitting(true)
    setFormError('')
    try {
      const created = await createFutureMessage({ baby_id: baby.id, user_id: user.id, title: formTitle.trim(), body: formBody.trim(), open_at_age: formAge })
      setMessages((prev) => [created, ...prev])
      // Desbloquear conquista "mensagem-tempo"
      unlockAchievement(baby.id, user.id, 'mensagem-tempo', 250).catch(() => {})
      setShowForm(false)
      setFormTitle('')
      setFormBody('')
      setFormAge(5)
      setSelectedAge(formAge)
    } catch (err) {
      console.error(err)
      setFormError('Erro ao salvar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F7', fontFamily: 'Inter, sans-serif', paddingBottom: 100 }}>
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
                border: active ? 'none' : '1.5px solid #E7E5F0',
                background: active ? '#6B53AE' : '#fff',
                color: active ? '#fff' : '#8B89B0',
                fontFamily: 'Inter, sans-serif',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: active ? '0 2px 12px rgba(107,83,174,0.3)' : 'none',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Messages */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && <div style={{ textAlign: 'center', color: '#8B89B0', padding: '40px 0', fontSize: 14 }}>Carregando...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8B89B0', fontSize: 14, padding: '40px 0' }}>
            Nenhuma mensagem para esta idade ainda.
          </div>
        )}
        {filtered.map((msg) => (
          <div key={msg.id} style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: 'linear-gradient(135deg,#B79BD8,#6B53AE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                {user?.name?.slice(0, 2).toUpperCase() ?? 'MM'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#2E2C4A' }}>{user?.name ?? 'Você'}</div>
                <div style={{ fontSize: 12, color: '#8B89B0' }}>
                  {new Date(msg.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ padding: '3px 10px', borderRadius: 99, background: '#E7E1F4', fontSize: 11, fontWeight: 600, color: '#6B53AE' }}>
                Aos {msg.open_at_age} anos
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2E2C4A', marginBottom: 8 }}>{msg.title}</div>
            <p style={{ fontSize: 14, color: '#2E2C4A', margin: 0, lineHeight: 1.6, opacity: 0.8 }}>{msg.body}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ margin: '20px 20px 0', background: '#fff', borderRadius: 18, padding: 20, border: '1.5px solid #E7E5F0', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#2E2C4A', margin: '0 0 14px' }}>Nova mensagem</p>

          <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Título</label>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Ex: Para você aos 5 anos"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', outline: 'none', marginBottom: 12, background: '#F4F3F7' }}
          />

          <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Mensagem</label>
          <textarea
            value={formBody}
            onChange={(e) => setFormBody(e.target.value)}
            placeholder="Escreva sua mensagem com amor..."
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', resize: 'none', outline: 'none', marginBottom: 12, background: '#F4F3F7' }}
          />

          <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Revelar aos</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {ageOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormAge(opt.value)}
                style={{ flex: 1, padding: '9px 0', border: formAge === opt.value ? 'none' : '1.5px solid #E7E5F0', borderRadius: 10, background: formAge === opt.value ? '#6B53AE' : '#F4F3F7', color: formAge === opt.value ? '#fff' : '#8B89B0', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                {opt.value} anos
              </button>
            ))}
          </div>

          {formError && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 10px' }}>{formError}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px 0', border: '1.5px solid #E7E5F0', borderRadius: 12, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#8B89B0', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting}
              style={{ flex: 2, padding: '11px 0', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {submitting ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      {/* CTA Button */}
      {!showForm && (
        <div style={{ padding: '24px 20px 32px' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{ width: '100%', padding: '15px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', boxShadow: '0 4px 20px rgba(107,83,174,0.35)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            + Criar nova mensagem
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
