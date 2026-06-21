'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { getFamilyMembers, createFamilyInvite } from '@/lib/supabase/queries'
import type { FamilyMember } from '@/types'

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const gradients = [
  'linear-gradient(135deg,#B79BD8,#6B53AE)',
  'linear-gradient(135deg,#F9A8D4,#C76FB0)',
  'linear-gradient(135deg,#86EFAC,#4F9E7C)',
]

const ROLE_OPTIONS = [
  { value: 'Pai', label: 'Pai' },
  { value: 'Mãe', label: 'Mãe' },
  { value: 'Avó', label: 'Avó' },
  { value: 'Avô', label: 'Avô' },
  { value: 'Tio', label: 'Tio/Tia' },
  { value: 'Outro', label: 'Outro' },
]

export default function FamiliaPage() {
  const router = useRouter()
  const { baby } = useApp()

  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  // Invite drawer state
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Outro')
  const [inviting, setInviting] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Link/QR modal
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [modalLink, setModalLink] = useState('')
  const [inviteError, setInviteError] = useState('')

  useEffect(() => {
    if (!baby?.id) return
    getFamilyMembers(baby.id).then(setMembers).catch(() => {}).finally(() => setLoading(false))
  }, [baby?.id])

  async function handleInvite() {
    if (!baby?.id || !inviteName.trim()) return
    setInviting(true)
    setInviteError('')
    try {
      const member = await createFamilyInvite(baby.id, inviteName.trim(), inviteEmail.trim(), inviteRole)
      const token = member.invite_token ?? null
      setInviteToken(token)
      getFamilyMembers(baby.id).then(setMembers).catch(() => {})
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar convite'
      setInviteError(msg)
      console.error('[invite]', err)
    } finally {
      setInviting(false)
    }
  }

  function getInviteLink(token: string) {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/convite/${token}`
  }

  async function handleCopyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  async function handleShare(link: string) {
    if (navigator.share) {
      try { await navigator.share({ title: `Você foi convidado para acompanhar ${baby?.name}!`, url: link }) } catch {}
    } else {
      setModalLink(link)
      setShowLinkModal(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F7', fontFamily: 'Inter, sans-serif', paddingBottom: 32 }}>
      <StatusBar />
      <ScreenHeader title="Família" onBack={() => router.back()} />

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, padding: '20px 20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { setShowInvite(true); setInviteToken(null) }}
            style={{ width: 60, height: 60, borderRadius: 30, background: '#E7E1F4', border: 'none', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}
          >
            📩
          </button>
          <span style={{ fontSize: 13, color: '#2E2C4A', fontWeight: 500 }}>Convidar</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { if (inviteToken) { setModalLink(getInviteLink(inviteToken)); setShowLinkModal(true) } else alert('Crie um convite primeiro') }}
            style={{ width: 60, height: 60, borderRadius: 30, background: '#E7E1F4', border: 'none', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}
          >
            📱
          </button>
          <span style={{ fontSize: 13, color: '#2E2C4A', fontWeight: 500 }}>QR Code</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { if (inviteToken) handleShare(getInviteLink(inviteToken)); else alert('Crie um convite primeiro') }}
            style={{ width: 60, height: 60, borderRadius: 30, background: '#E7E1F4', border: 'none', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}
          >
            🔗
          </button>
          <span style={{ fontSize: 13, color: '#2E2C4A', fontWeight: 500 }}>Link</span>
        </div>
      </div>

      {/* Family List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#8B89B0', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
          Membros
        </div>
        {loading && <div style={{ textAlign: 'center', color: '#8B89B0', padding: '20px 0', fontSize: 14 }}>Carregando...</div>}
        {!loading && members.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8B89B0', padding: '32px 0', fontSize: 14 }}>
            Nenhum familiar adicionado ainda.
          </div>
        )}
        {members.map((member, i) => (
          <div key={member.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: gradients[i % gradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>
              {getInitials(member.name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#2E2C4A' }}>{member.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: member.status === 'accepted' ? '#E2F1EA' : '#FEF3C7', color: member.status === 'accepted' ? '#4F9E7C' : '#B45309' }}>
                  {member.status === 'accepted' ? 'Aceitou' : 'Pendente'}
                </span>
              </div>
            </div>
            <Icon name="heart" size={18} color="#F472B6" />
          </div>
        ))}
      </div>

      {/* Feed CTA */}
      <div style={{ padding: '20px 20px 32px' }}>
        <Link href="/perfil/familia/feed" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #F3EFFA 0%, #E7E1F4 100%)', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#6B53AE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="rss" size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#2E2C4A' }}>Feed da Família</div>
              <div style={{ fontSize: 13, color: '#8B89B0' }}>Compartilhe momentos especiais</div>
            </div>
            <Icon name="chevron-right" size={18} color="#8B89B0" />
          </div>
        </Link>
      </div>

      {/* Invite bottom drawer */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18,17,26,.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowInvite(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ width: 40, height: 4, borderRadius: 999, background: '#E7E5F0', alignSelf: 'center', marginBottom: 4 }} />
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: '#2E2C4A', margin: 0 }}>Convidar familiar</h3>

            {!inviteToken ? (
              <>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Nome *</label>
                  <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Ex: Vó Maria" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', outline: 'none', background: '#F4F3F7' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Email (opcional)</label>
                  <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} type="email" placeholder="familiar@email.com" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', outline: 'none', background: '#F4F3F7' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Papel</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', background: '#F4F3F7', outline: 'none', appearance: 'none' }}>
                    {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                {inviteError && (
                  <div style={{ background: '#FCE7F3', borderRadius: 10, padding: '10px 14px' }}>
                    <p style={{ fontSize: 13, color: '#C76FB0', margin: 0, fontFamily: 'Inter, sans-serif' }}>{inviteError}</p>
                  </div>
                )}
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteName.trim()}
                  style={{ padding: '14px', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', cursor: inviting || !inviteName.trim() ? 'not-allowed' : 'pointer', opacity: inviteName.trim() ? 1 : 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {inviting ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : 'Convidar'}
                </button>
              </>
            ) : (
              <>
                <div style={{ background: '#F3EFFA', borderRadius: 14, padding: 14 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6B53AE', margin: '0 0 6px' }}>Link do convite</p>
                  <p style={{ fontSize: 13, color: '#2E2C4A', margin: '0 0 12px', wordBreak: 'break-all' }}>{getInviteLink(inviteToken)}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleCopyLink(getInviteLink(inviteToken))} style={{ flex: 1, padding: '10px', border: '1.5px solid #E7E5F0', borderRadius: 10, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#6B53AE', cursor: 'pointer' }}>
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button onClick={() => handleShare(getInviteLink(inviteToken!))} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 10, background: '#6B53AE', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#fff', cursor: 'pointer' }}>
                      Compartilhar
                    </button>
                  </div>
                </div>
                <button onClick={() => { setShowInvite(false); setInviteToken(null); setInviteName(''); setInviteEmail(''); setInviteRole('Outro') }} style={{ padding: '12px', border: '1.5px solid #E7E5F0', borderRadius: 14, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#8B89B0', cursor: 'pointer' }}>
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Link/QR modal */}
      {showLinkModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18,17,26,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }} onClick={() => setShowLinkModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 24, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: '#2E2C4A', margin: 0, textAlign: 'center' }}>Link do convite</h3>
            <div style={{ background: '#F3EFFA', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: '#2E2C4A', margin: 0, wordBreak: 'break-all' }}>{modalLink}</p>
            </div>
            <button onClick={() => handleCopyLink(modalLink)} style={{ padding: '12px', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#B79BD8,#6B53AE)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer' }}>
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <button onClick={() => setShowLinkModal(false)} style={{ padding: '10px', border: '1.5px solid #E7E5F0', borderRadius: 12, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 13, color: '#8B89B0', cursor: 'pointer' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
