'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'

export default function EsqueciSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />
      <ScreenHeader onBack={() => router.push('/login')} />

      <div style={{ flex: 1, padding: '8px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sent ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={36} color="var(--success)" strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)', marginBottom: 8 }}>E-mail enviado!</h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                Verifique sua caixa de entrada em <strong>{email}</strong> e siga as instruções para redefinir sua senha.
              </p>
            </div>
            <Button fullWidth onClick={() => router.push('/login')}>Voltar ao login</Button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--violet-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="lock" size={28} color="var(--accent)" />
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)' }}>Esqueceu a senha?</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                Digite seu e-mail e enviaremos um link para você redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button type="submit" fullWidth loading={loading} disabled={!email}>
                Enviar link de redefinição
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
