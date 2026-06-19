'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import { useApp } from '@/contexts/AppContext'
import type { User } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !password) { setError('Preencha todos os campos.'); return }
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      plan: 'free',
      created_at: new Date().toISOString(),
    }
    setUser(newUser)
    router.push('/criar-bebe/passo-1')
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

          {error && <p style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>{error}</p>}

          <Button type="submit" fullWidth loading={loading} style={{ marginTop: 8 }}>
            Criar conta
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
          Ao criar uma conta, você concorda com os{' '}
          <Link href="/termos" style={{ color: 'var(--text-accent)', fontWeight: 500, textDecoration: 'none' }}>Termos de Uso</Link>
          {' '}e{' '}
          <Link href="/privacidade" style={{ color: 'var(--text-accent)', fontWeight: 500, textDecoration: 'none' }}>Política de Privacidade</Link>
          {' '}do Memora Bebê.
        </p>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--text-accent)', fontWeight: 700, textDecoration: 'none' }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
