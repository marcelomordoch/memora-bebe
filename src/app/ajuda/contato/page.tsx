'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import AppShell from '@/components/layout/AppShell'
import { useApp } from '@/contexts/AppContext'

const SUBJECTS = [
  'Dúvida sobre plano',
  'Problema com créditos',
  'Gift card',
  'Problema técnico',
  'Cancelamento',
  'Outro',
]

export default function ContatoPage() {
  const router = useRouter()
  const { user } = useApp()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, userId: user?.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Erro ao enviar. Tente novamente.')
        return
      }
      setSent(true)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 16px',
    borderRadius: 12,
    border: '1.5px solid #E7E5F0',
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    color: '#2E2C4A',
    background: '#FAFAFA',
    outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: '#8B89B0',
    fontFamily: 'Inter, sans-serif',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <AppShell>
      <div style={{ background: '#F4F3F7', minHeight: '100vh', paddingBottom: 40 }}>
        <div style={{ background: '#fff' }}>
          <StatusBar />
          <ScreenHeader title="Falar com suporte" onBack={() => router.back()} />
        </div>

        <div style={{ padding: '20px 16px' }}>
          {sent ? (
            /* ── Success ── */
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '40px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Icon name="check" size={32} color="#059669" strokeWidth={2.5} />
              </div>
              <p style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                color: '#2E2C4A',
                margin: '0 0 10px',
              }}>
                Mensagem enviada!
              </p>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: '#8B89B0',
                margin: '0 0 28px',
                lineHeight: 1.6,
              }}>
                Recebemos sua mensagem e responderemos em até 48 horas no e-mail <strong style={{ color: '#2E2C4A' }}>{email}</strong>.
              </p>
              <Button variant="primary" fullWidth onClick={() => router.push('/inicio')}>
                Voltar ao início
              </Button>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: '20px 18px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}>
                <div>
                  <label style={labelStyle}>Seu nome</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Como posso te chamar?"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>E-mail para resposta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Assunto</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Mensagem</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Descreva sua dúvida ou problema com o máximo de detalhes..."
                    required
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  background: '#FEE2E2',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}>
                  <Icon name="alert-circle" size={16} color="#DC2626" />
                  <p style={{ fontSize: 13, color: '#DC2626', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    {error}
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                loading={loading}
                disabled={!name.trim() || !email.trim() || !message.trim()}
              >
                Enviar mensagem
              </Button>

              <p style={{
                fontSize: 12,
                color: '#8B89B0',
                textAlign: 'center',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
              }}>
                Respondemos em até 48 horas nos dias úteis.
              </p>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  )
}
