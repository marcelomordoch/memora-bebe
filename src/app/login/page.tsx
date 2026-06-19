'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import StatusBar from '@/components/ui/StatusBar'
import { useApp, DEMO_USER, DEMO_BABY } from '@/contexts/AppContext'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setBaby } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Demo login — aceita qualquer email/senha não vazios
    await new Promise(r => setTimeout(r, 800))

    if (!email || !password) {
      setError('Preencha e-mail e senha.')
      setLoading(false)
      return
    }

    setUser(DEMO_USER)
    setBaby(DEMO_BABY)
    router.push('/onboarding')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar light />

      {/* Hero */}
      <div style={{
        background: 'var(--gradient-brand)',
        padding: '24px 24px 56px',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', top: 20, left: -50, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
          }}>💜</div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: '#fff' }}>memora</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,.65)' }}>bebê</span>
          </div>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
            A memória emocional da infância.
          </p>
        </div>
      </div>

      {/* White sheet */}
      <div style={{
        background: '#fff', borderRadius: '28px 28px 0 0',
        marginTop: -28, flex: 1, padding: '28px 20px 32px',
        display: 'flex', flexDirection: 'column', gap: 20,
        overflowY: 'auto',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-strong)' }}>
            Bem-vinda de volta! 💜
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
            Entre para continuar registrando cada momento especial.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com.br"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div>
            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <Link href="/esqueci-senha" style={{ fontSize: 13, color: 'var(--text-accent)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>
                Esqueci minha senha
              </Link>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Entrar
          </Button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>ou continue com</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 14,
            border: '1.5px solid var(--border-strong)', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15,
            color: 'var(--text-strong)', boxShadow: 'var(--shadow-sm)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Não tem conta?{' '}
          <Link href="/register" style={{ color: 'var(--text-accent)', fontWeight: 700, textDecoration: 'none' }}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
