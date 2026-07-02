'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/contexts/AppContext'
import { getAchievements, getFamilyMembers, uploadBabyPhoto, updateBaby } from '@/lib/supabase/queries'
import { calculateCurrentWeek, formatLocalDate } from '@/lib/utils'
import { useSignedUrl } from '@/hooks/useSignedUrl'

const links = [
  {
    label: 'Árvore da Vida',
    subtitle: 'Veja sua jornada visual',
    href: '/conquistas/arvore',
    icon: 'leaf',
    bgColor: '#E7E1F4',
  },
  {
    label: 'Família',
    subtitle: 'Gerencie seus familiares',
    href: '/perfil/familia',
    icon: 'users',
    bgColor: '#FCE7F3',
  },
  {
    label: 'Mensagens para o Futuro',
    subtitle: 'Cartas para quando crescer',
    href: '/perfil/mensagens',
    icon: 'clock',
    bgColor: '#E2F1EA',
  },
  {
    label: 'Gift Cards & Loja',
    subtitle: 'Presentes e benefícios',
    href: '/perfil/loja',
    icon: 'gift',
    bgColor: '#FEF3C7',
  },
]

export default function PerfilPage() {
  const { baby, setBaby, logout } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [achievementsCount, setAchievementsCount] = useState(0)
  const [familyCount, setFamilyCount] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [photoUploading, setPhotoUploading] = useState(false)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(baby?.name ?? '')
  const [editAbout, setEditAbout] = useState(baby?.about ?? '')
  const [editBirthDate, setEditBirthDate] = useState(baby?.birth_date ?? '')
  const [saving, setSaving] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(baby?.photo_url ?? '')
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false)
  const signedPhotoUrl = useSignedUrl(photoUrl || null)

  // Sincroniza photoUrl sempre que o baby carregar/atualizar (baby chega async do AppContext)
  useEffect(() => {
    setPhotoUrl(baby?.photo_url ?? '')
    setPhotoLoadFailed(false)
  }, [baby?.photo_url])

  useEffect(() => {
    if (!baby?.id) return
    getAchievements(baby.id).then((list) => {
      const unlocked = list.filter((a) => a.unlocked)
      setAchievementsCount(unlocked.length)
      setTotalXP(unlocked.reduce((s, a) => s + (a.xp ?? 0), 0))
    }).catch(() => {})
    getFamilyMembers(baby.id).then((list) => {
      setFamilyCount(list.length)
    }).catch(() => {})
  }, [baby?.id])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !baby?.id) return
    setPhotoUploading(true)
    try {
      const url = await uploadBabyPhoto(baby.id, file)
      setPhotoUrl(url)
      setBaby({ ...baby, photo_url: url })
    } catch (err) {
      console.error(err)
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleSaveEdit() {
    if (!baby?.id) return
    setSaving(true)
    try {
      const updates: Parameters<typeof updateBaby>[1] = { name: editName, about: editAbout }
      if (editBirthDate) updates.birth_date = editBirthDate
      await updateBaby(baby.id, updates)
      setBaby({ ...baby, name: editName, about: editAbout, ...(editBirthDate ? { birth_date: editBirthDate } : {}) })
      setEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const currentWeek = baby ? calculateCurrentWeek(baby) : 0
  const statusLabel = baby?.status === 'gestacao'
    ? currentWeek ? `${currentWeek}ª semana de gestação` : 'Em gestação'
    : baby?.birth_date
      ? `Nascido(a) em ${formatLocalDate(baby.birth_date)}`
      : 'Bebê registrado'

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F7', fontFamily: 'Inter, sans-serif', paddingBottom: 32 }}>
      <StatusBar />

      {/* Avatar Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 20px 8px' }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          {/* Avatar */}
          <div style={{ width: 96, height: 96, borderRadius: 48, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, border: '3px solid #fff', boxShadow: '0 4px 20px rgba(107,83,174,0.35)', overflow: 'hidden', position: 'relative' }}>
            {signedPhotoUrl && !photoLoadFailed
              ? <img src={signedPhotoUrl} alt={baby?.name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setPhotoLoadFailed(true)} onLoad={() => setPhotoLoadFailed(false)} />
              : <span>💜</span>
            }
          </div>
          {/* Camera badge */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              background: '#6B53AE',
              border: '3px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {photoUploading
              ? <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              : <Icon name="camera" size={14} color="#fff" strokeWidth={2.5} />
            }
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: '#2E2C4A', margin: '0 0 4px' }}>
          {baby?.name ?? 'Bebê'}
        </h2>
        <p style={{ fontSize: 14, color: '#8B89B0', margin: '0 0 10px' }}>{statusLabel}</p>
        <button
          onClick={() => { setEditing(true); setEditName(baby?.name ?? ''); setEditAbout(baby?.about ?? ''); setEditBirthDate(baby?.birth_date ?? '') }}
          style={{
            padding: '7px 20px',
            border: '1.5px solid #E7E5F0',
            borderRadius: 99,
            background: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 13,
            color: '#6B53AE',
            cursor: 'pointer',
          }}
        >
          Editar perfil
        </button>
      </div>

      {/* Inline edit form */}
      {editing && (
        <div style={{ margin: '12px 20px', background: '#fff', borderRadius: 18, padding: 20, border: '1.5px solid #E7E5F0' }}>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 15, color: '#2E2C4A', margin: '0 0 14px' }}>Editar perfil</p>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Nome do bebê</label>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', marginBottom: 12, outline: 'none', background: '#F4F3F7' }}
          />
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Data de nascimento</label>
          <input
            type="date"
            value={editBirthDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setEditBirthDate(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', marginBottom: 12, outline: 'none', background: '#F4F3F7' }}
          />
          <label style={{ fontSize: 12, fontWeight: 600, color: '#8B89B0', display: 'block', marginBottom: 4 }}>Sobre</label>
          <textarea
            value={editAbout}
            onChange={(e) => setEditAbout(e.target.value)}
            rows={3}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1.5px solid #E7E5F0', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#2E2C4A', resize: 'none', outline: 'none', marginBottom: 14, background: '#F4F3F7' }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setEditing(false)}
              style={{ flex: 1, padding: '11px 0', border: '1.5px solid #E7E5F0', borderRadius: 12, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#8B89B0', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              style={{ flex: 2, padding: '11px 0', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {saving ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : 'Salvar'}
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div style={{ margin: '16px 20px', background: '#fff', borderRadius: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex' }}>
        {[
          { label: 'Marcos', value: String(achievementsCount) },
          { label: 'XP', value: String(totalXP) },
          { label: 'Família', value: String(familyCount) },
        ].map((stat, i) => (
          <div key={stat.label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: i < 2 ? '1px solid #E7E5F0' : 'none' }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 17, color: '#6B53AE' }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#8B89B0', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* About Card */}
      {(baby?.about || editAbout) && !editing && (
        <div style={{ margin: '0 20px 16px', background: 'linear-gradient(135deg, #F3EFFA 0%, #E7E1F4 100%)', borderRadius: 18, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B53AE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>Sobre</div>
          <p style={{ fontSize: 14, color: '#2E2C4A', margin: 0, lineHeight: 1.6 }}>{baby?.about}</p>
        </div>
      )}

      {/* Link List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: link.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={link.icon} size={20} color="#6B53AE" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#2E2C4A' }}>{link.label}</div>
                <div style={{ fontSize: 13, color: '#8B89B0' }}>{link.subtitle}</div>
              </div>
              <Icon name="chevron-right" size={18} color="#8B89B0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '20px 20px 32px' }}>
        <button
          onClick={logout}
          style={{ width: '100%', padding: '14px', border: '1.5px solid #E7E5F0', borderRadius: 14, background: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15, color: '#8B89B0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Icon name="log-out" size={18} color="#8B89B0" />
          Sair da conta
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
