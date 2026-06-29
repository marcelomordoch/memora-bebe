'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'
import AppShell from '@/components/layout/AppShell'
import { useApp } from '@/contexts/AppContext'
import { getFamilyMembers } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import type { FamilyMember } from '@/types'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const gradients = [
  'linear-gradient(135deg,#B79BD8,#6B53AE)',
  'linear-gradient(135deg,#F9A8D4,#C76FB0)',
  'linear-gradient(135deg,#86EFAC,#4F9E7C)',
]

export default function FamiliaPage() {
  const router = useRouter()
  const { baby } = useApp()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!baby?.id) { setLoading(false); return }
    getFamilyMembers(baby.id).then(setMembers).catch(() => {}).finally(() => setLoading(false))
  }, [baby?.id])

  async function handleDelete(memberId: string, name: string) {
    if (!confirm(`Remover ${name} da família?`)) return
    const supabase = createClient()
    await supabase.from('family_members').delete().eq('id', memberId)
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100dvh', paddingBottom: 32 }}>
        <StatusBar />
        <ScreenHeader title="Família" onBack={() => router.back()} />

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Info card */}
          <div style={{ background: 'var(--violet-50)', borderRadius: 18, padding: '16px 18px', border: '1px dashed var(--violet-200)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--accent)', margin: '0 0 4px' }}>
              Compartilhamento em breve 🚀
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: 0, lineHeight: 1.5 }}>
              O sistema de convites por link estará disponível na próxima versão do Memora Bebê.
            </p>
          </div>

          {/* Members */}
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, margin: 0 }}>
            Membros ({members.length})
          </p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <span style={{ width: 28, height: 28, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍👩‍👧</div>
              <p style={{ fontSize: 15, margin: 0 }}>Nenhum familiar adicionado ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map((member, i) => (
                <div key={member.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradients[i % gradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>
                    {getInitials(member.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{member.role}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: member.status === 'accepted' ? 'var(--success-soft)' : 'var(--warning-soft)', color: member.status === 'accepted' ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }}>
                    {member.status === 'accepted' ? 'Ativo' : 'Pendente'}
                  </span>
                  <button onClick={() => handleDelete(member.id, member.name)} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--rose-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="trash" size={14} color="var(--rose-500)" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  )
}
