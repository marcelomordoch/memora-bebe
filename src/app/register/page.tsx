'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useApp } from '@/contexts/AppContext'
import { signUpWithEmail } from '@/lib/supabase/queries'

function translateError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('User already registered')) {
    return 'Já existe uma conta com esse e-mail.'
  }
  if (msg.includes('Password should be')) {
    return 'Senha deve ter pelo menos 6 caracteres.'
  }
  if (msg.includes('invalid email') || msg.includes('Invalid email')) {
    return 'E-mail inválido.'
  }
  if (msg.includes('Too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos.'
  }
  return 'Ocorreu um erro ao criar a conta. Tente novamente.'
}

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) { setError('Preencha todos os campos.'); return }
    if (!acceptedTerms) { setError('Você precisa aceitar os Termos de Uso para continuar.'); return }
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setError('')

    try {
      const data = await signUpWithEmail(email, password, name)
      const authUser = data.user
      if (!authUser) throw new Error('Falha ao criar conta.')

      setUser({
        id: authUser.id,
        email: authUser.email ?? email,
        name,
        plan: 'free',
        storage_plan: 'free',
        storage_limit_gb: 1,
        account_credit_brl: 0,
        created_at: authUser.created_at,
      })

      router.push('/criar-bebe/passo-1')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(translateError(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />
      <ScreenHeader onBack={() => router.push('/login')} />

      <div style={{ flex: 1, padding: '8px 20px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>💜</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text-strong)', textAlign: 'center' }}>
            Criar sua conta
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
            Comece a registrar cada momento especial do seu bebê.
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nome completo" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
          <Input label="E-mail" type="email" placeholder="seu@email.com.br" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />

          {/* Checkbox de aceite */}
          <button
            type="button"
            onClick={() => { setAcceptedTerms(v => !v); setError('') }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: acceptedTerms ? '#F5F2FF' : '#FAFAFA',
              border: acceptedTerms ? '1.5px solid #C4B8E8' : '1.5px solid var(--border-strong)',
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
              textAlign: 'left', width: '100%', transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
              border: acceptedTerms ? 'none' : '2px solid #C4B8E8',
              background: acceptedTerms ? '#6B53AE' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}>
              {acceptedTerms && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-body)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
              Li e concordo com os{' '}
              <Link
                href="/termos"
                onClick={e => e.stopPropagation()}
                style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Termos de Uso
              </Link>
              {' '}e a{' '}
              <Link
                href="/privacidade"
                onClick={e => e.stopPropagation()}
                style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Política de Privacidade
              </Link>
              , incluindo a limitação de responsabilidade por uso indevido e incidentes de segurança.
            </span>
          </button>

          {error && <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>{error}</p>}

          <Button type="submit" fullWidth loading={loading} disabled={!acceptedTerms} style={{ marginTop: 4 }}>
            Criar conta
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--text-accent)', fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
