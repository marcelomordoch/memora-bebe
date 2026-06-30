import { createClient } from '@/lib/supabase/client'
import { uploadToR2 } from '@/lib/r2/upload'
import type { Baby, Memory, FamilyMember, FutureMessage, GiftCard, Notification, Achievement } from '@/types'

const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlocked' | 'unlocked_at'>[] = [
  { id: 'primeira-memoria',  title: 'Primeira Memória',     description: 'Registrou sua primeira memória',           xp: 50,  icon: 'star'      },
  { id: 'narrador',          title: 'Narrador(a)',          description: 'Gravou seu primeiro áudio',                xp: 100, icon: 'mic'       },
  { id: 'escritor',          title: 'Escritor(a)',          description: 'Registrou 10 memórias',                    xp: 200, icon: 'file-text' },
  { id: 'fotografo',         title: 'Fotógrafo(a)',         description: 'Adicionou 5 fotos',                        xp: 150, icon: 'camera'    },
  { id: 'mensagem-tempo',    title: 'Mensagem no Tempo',    description: 'Criou uma mensagem para o futuro',         xp: 250, icon: 'clock'     },
  { id: 'marco-mes',         title: 'Marco do Mês',         description: 'Registrou memórias por 30 dias seguidos',  xp: 500, icon: 'award'     },
]

// ── AUTH ──────────────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function getCurrentProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name } },
  })
  if (error) throw error

  // O trigger handle_new_user cria o perfil — não precisamos fazer nada aqui

  return data
}

// Mantida por compatibilidade — o perfil é criado pelo trigger ou pela API route /api/setup
export async function ensureProfile(_userId: string, _email: string, _name: string): Promise<void> {
  // Perfil é garantido pelo trigger handle_new_user e pela rota /api/setup
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/nova-senha`,
  })
  if (error) throw error
}

// ── BABY ──────────────────────────────────────────────────────────────────────

export async function getBaby(userId: string): Promise<Baby | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('babies').select('*').eq('user_id', userId).limit(1).single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function createBaby(data: Partial<Baby> | Record<string, unknown>): Promise<Baby> {
  const supabase = createClient()
  // Nunca enviar id vazio — Supabase gera automaticamente via uuid_generate_v4()
  const payload = { ...data }
  if (!payload.id || payload.id === '') delete payload.id
  const { data: created, error } = await supabase.from('babies').insert(payload).select().single()
  if (error) throw new Error(error.message || JSON.stringify(error))
  return created
}

export async function updateBaby(id: string, data: Partial<Baby>): Promise<Baby> {
  const supabase = createClient()
  const { data: updated, error } = await supabase.from('babies').update(data).eq('id', id).select().single()
  if (error) throw error
  return updated
}

export async function uploadBabyPhoto(babyId: string, file: File): Promise<string> {
  const publicUrl = await uploadToR2(file, 'babies')
  await updateBaby(babyId, { photo_url: publicUrl })
  return publicUrl
}

// ── MEMORIES ──────────────────────────────────────────────────────────────────

export async function getMemories(babyId: string, lifeStage?: string): Promise<Memory[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase.from('memories').select('*').eq('baby_id', babyId).order('created_at', { ascending: false })
  if (lifeStage && lifeStage !== 'all') query = query.eq('life_stage', lifeStage)

  const { data: memories, error } = await query
  if (error) throw error
  if (!memories?.length) return []

  if (!user) return memories.map(m => ({ ...m, liked_by_me: false }))

  const { data: likes } = await supabase
    .from('memory_likes').select('memory_id').eq('user_id', user.id)
    .in('memory_id', memories.map(m => m.id))

  const likedSet = new Set((likes ?? []).map(l => l.memory_id))
  return memories.map(m => ({ ...m, liked_by_me: likedSet.has(m.id) }))
}

export async function createMemory(data: Omit<Memory, 'id' | 'created_at' | 'likes_count'>): Promise<Memory> {
  const supabase = createClient()
  const { data: created, error } = await supabase
    .from('memories').insert({ ...data, likes_count: 0 }).select().single()
  if (error) throw error
  return created
}

export async function deleteMemory(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('memories').delete().eq('id', id)
  if (error) throw error
}

export async function toggleLike(memoryId: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('toggle_memory_like', { p_memory_id: memoryId, p_user_id: userId })
  if (error) throw error
}

export async function uploadMemoryMedia(memoryId: string, file: File, type: string): Promise<string> {
  const folder = type === 'video' ? 'videos' : type === 'audio' ? 'audio' : 'memories'
  const publicUrl = await uploadToR2(file, folder)
  const supabase = createClient()
  await supabase.from('memories').update({ media_url: publicUrl }).eq('id', memoryId)
  return publicUrl
}

// ── FAMILY ────────────────────────────────────────────────────────────────────

export async function getFamilyMembers(babyId: string): Promise<FamilyMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('family_members').select('*').eq('baby_id', babyId).order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createFamilyInvite(babyId: string, name: string, email: string, role: string): Promise<FamilyMember> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const token = crypto.randomUUID()
  const payload: Record<string, unknown> = {
    baby_id: babyId,
    user_id: user.id,
    name,
    role,
    status: 'pending',
    invite_token: token,
  }
  // invited_email é opcional
  if (email && email.trim()) payload.invited_email = email.trim()
  const { data, error } = await supabase
    .from('family_members')
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function acceptFamilyInvite(token: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('family_members').update({ status: 'accepted', user_id: userId }).eq('invite_token', token)
  if (error) throw error
}

export async function getFamilyInvite(token: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('family_members').select('*, babies(name, gender)').eq('invite_token', token).single()
  if (error) return null
  return data
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────────────────────

export async function getAchievements(babyId: string): Promise<Achievement[]> {
  const supabase = createClient()
  const { data: unlocked } = await supabase.from('achievements').select('*').eq('baby_id', babyId)
  const unlockedMap = new Map((unlocked ?? []).map(a => [a.achievement_key, a]))
  return ACHIEVEMENTS_LIST.map(a => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlocked_at: unlockedMap.get(a.id)?.unlocked_at,
  }))
}

export async function unlockAchievement(babyId: string, userId: string, key: string, xp: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('achievements').upsert(
    { baby_id: babyId, user_id: userId, achievement_key: key, xp, unlocked_at: new Date().toISOString() },
    { onConflict: 'baby_id,achievement_key', ignoreDuplicates: true }
  )
  if (error) throw error
}

// ── FUTURE MESSAGES ───────────────────────────────────────────────────────────

export async function getFutureMessages(babyId: string): Promise<FutureMessage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('future_messages').select('*').eq('baby_id', babyId).order('open_at_age', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createFutureMessage(data: Omit<FutureMessage, 'id' | 'created_at'>): Promise<FutureMessage> {
  const supabase = createClient()
  const { data: created, error } = await supabase.from('future_messages').insert(data).select().single()
  if (error) throw error
  return created
}

// ── GIFT CARDS ────────────────────────────────────────────────────────────────

export async function redeemGiftCard(code: string, userId: string): Promise<{ amount: number }> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('redeem_gift_card_fn', {
    p_code: code.toUpperCase().trim(),
    p_user_id: userId,
  })
  if (error) throw error
  if (!data.success) throw new Error(data.error)
  return { amount: data.amount }
}

export async function getGiftCards(userId: string): Promise<GiftCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gift_cards').select('*').eq('redeemed_by', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(50)
  if (error) throw error
  return data ?? []
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  if (error) throw error
}

export async function createNotification(userId: string, type: string, title: string, body: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications').insert({ user_id: userId, type, title, body, read: false }).select().single()
  if (error) throw error
  return data
}

// ── PLAN ──────────────────────────────────────────────────────────────────────

export async function upgradeToPremium(userId: string): Promise<void> {
  const supabase = createClient()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  const { error } = await supabase
    .from('profiles').update({ plan: 'premium', plan_expires_at: expiresAt.toISOString() }).eq('id', userId)
  if (error) throw error
}
