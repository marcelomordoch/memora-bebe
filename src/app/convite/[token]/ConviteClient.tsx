'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import StatusBar from '@/components/ui/StatusBar'

interface InviteData {
  id: string
  name: string
  role: string
  status: string
  babies: { id: string; name: string; gender: string; photo_url?: string | null } | null
}

interface Props {
  invite: InviteData | null
  token: string
}

export default function ConviteClient({ invite, token }: Props) {
  const { user } = useApp()
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)

  const baby = invite?.babies

  if (!invite) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F4F3F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: 'Inter, sans-serif' }}>
        <StatusBar />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>😕</div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: '#2E2C4A', margin: '0 0 10px' }}>
            Convite inválido ou expirado
          </h2>
          <p style={{ fontSize: 14, color: '#8B89B0', margin: '0 0 28px', lineHeight: 1.6, maxWidth: 280 }}>
            Este link de convite não é mais válido. Peça um novo convite ao responsável.
          </p>
          <Link href="/" style={{ padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
            Ir para o início
          </Link>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F4F3F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: '#2E2C4A', margin: '0 0 10px' }}>
          Convite aceito!
        </h2>
        <p style={{ fontSize: 14, color: '#8B89B0', margin: '0 0 28px', lineHeight: 1.6 }}>
          Agora você acompanha os momentos especiais de {baby?.name ?? 'bebê'} 💜
        </p>
        <Link href="/inicio" style={{ padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
          Ver memórias
        </Link>
      </div>
    )
  }

  async function handleAccept() {
    if (!user?.id) return
    setAccepting(true)
    setError('')
    try {
      // Usa API route server-side com service role para ignorar RLS
      const res = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Erro ao aceitar o convite.')
        setAccepting(false)
        return
      }
      setAccepted(true)
    } catch {
      setError('Erro ao aceitar o convite. Tente novamente.')
      setAccepting(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F4F3F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', fontFamily: 'Inter, sans-serif' }}>
      <StatusBar />

      {/* Baby card */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 24, textAlign: 'center' }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, margin: '0 auto 16px',
          border: '3px solid #fff', boxShadow: '0 4px 16px rgba(107,83,174,0.3)',
        }}>
          👶
        </div>

        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: '#2E2C4A', margin: '0 0 6px' }}>
          {baby?.name ?? 'Bebê'}
        </h2>
        <p style={{ fontSize: 14, color: '#8B89B0', margin: '0 0 16px' }}>
          Você foi convidado(a) por {invite.name}
        </p>
        <div style={{ background: '#F3EFFA', borderRadius: 12, padding: '10px 14px' }}>
          <p style={{ fontSize: 13, color: '#6B53AE', margin: 0, fontWeight: 600 }}>
            Acompanhe os momentos especiais e registre memórias juntos 💜
          </p>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {error && <p style={{ color: '#C56B6B', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}

        {!user ? (
          <>
            <p style={{ fontSize: 14, color: '#8B89B0', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              Faça login para aceitar este convite.
            </p>
            <Link
              href={`/login?redirect=/convite/${token}`}
              style={{
                display: 'block', padding: '15px 0', borderRadius: 16,
                background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
                color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                fontSize: 15, textAlign: 'center', textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(107,83,174,0.35)',
              }}
            >
              Fazer login para aceitar
            </Link>
            <Link
              href={`/register?redirect=/convite/${token}`}
              style={{
                display: 'block', padding: '13px 0', borderRadius: 16,
                border: '1.5px solid #E7E5F0', background: '#fff',
                color: '#6B53AE', fontFamily: 'Inter, sans-serif',
                fontWeight: 600, fontSize: 14, textAlign: 'center', textDecoration: 'none',
              }}
            >
              Criar conta grátis
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={handleAccept}
              disabled={accepting}
              style={{
                padding: '15px 0', border: 'none', borderRadius: 16,
                background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
                color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700,
                fontSize: 15, cursor: accepting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(107,83,174,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: accepting ? 0.8 : 1,
              }}
            >
              {accepting
                ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : 'Aceitar convite'
              }
            </button>
            <Link href="/inicio" style={{ display: 'block', padding: '13px 0', borderRadius: 16, border: '1.5px solid #E7E5F0', background: '#fff', color: '#8B89B0', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}>
              Agora não
            </Link>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
