'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import StatusBar from '@/components/ui/StatusBar'
import { useApp } from '@/contexts/AppContext'
import { signInWithEmail, signInWithGoogle, getBaby, getUser, ensureProfile } from '@/lib/supabase/queries'

// Map Supabase English error messages to Portuguese
function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Tente novamente.'
  }
  if (msg.includes('Email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.'
  }
  if (msg.includes('Too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos.'
  }
  if (msg.includes('User not found')) {
    return 'Nenhuma conta encontrada com esse e-mail.'
  }
  return 'Ocorreu um erro. Tente novamente.'
}

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setBaby } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const data = await signInWithEmail(email, password)
      const authUser = data.user
      if (!authUser) throw new Error('Usuário não encontrado.')

      // Garantir que o perfil existe (cria se não existir)
      await ensureProfile(
        authUser.id,
        authUser.email ?? email,
        authUser.user_metadata?.name ?? email.split('@')[0]
      )

      // Fetch profile and baby
      const profile = await getUser(authUser.id)
      if (profile) setUser(profile)
      else {
        setUser({
          id: authUser.id,
          email: authUser.email ?? '',
          name: authUser.user_metadata?.name ?? '',
          plan: 'free',
          created_at: authUser.created_at,
        })
      }

      const babyData = await getBaby(authUser.id)
      if (babyData) setBaby(babyData)

      router.push('/inicio')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(translateError(msg))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      // OAuth redirects automatically; no need to push
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(translateError(msg))
      setGoogleLoading(false)
    }
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

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <img
            src="/logo-login.png"
            alt="Memora Bebê"
            style={{ width: 180, height: 'auto', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,.22)' }}
          />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.8)', fontFamily: 'var(--font-body)', textAlign: 'center', margin: 0 }}>
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
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 14,
            border: '1.5px solid var(--border-strong)', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15,
            color: 'var(--text-strong)', boxShadow: 'var(--shadow-sm)',
            opacity: googleLoading ? 0.6 : 1,
          }}
        >
          {googleLoading ? (
            <span style={{
              width: 18, height: 18, border: '2px solid var(--border-strong)',
              borderTopColor: 'var(--accent)', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite', display: 'inline-block',
            }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
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
