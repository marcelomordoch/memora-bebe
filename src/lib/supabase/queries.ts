import { createClient } from '@/lib/supabase/client'
import { uploadToR2 } from '@/lib/r2/upload'
import type { Baby, Memory, FamilyMember, FutureMessage, GiftCard, Notification, Achievement } from '@/types'

const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlocked' | 'unlocked_at'>[] = [
  // Memórias
  { id: 'primeira-memoria',   title: 'Primeira Memória',        description: 'Registrou sua primeira memória',              xp: 50,   icon: 'star'       },
  { id: 'cinco-memorias',     title: 'Cinco Memórias',          description: 'Registrou 5 memórias',                        xp: 100,  icon: 'book'       },
  { id: 'escritor',           title: 'Escritor(a)',             description: 'Registrou 10 memórias',                       xp: 200,  icon: 'file-text'  },
  { id: 'vinte-memorias',     title: 'Historiador(a)',          description: 'Registrou 20 memórias',                       xp: 300,  icon: 'book-open'  },
  { id: 'cinquenta-memorias', title: 'Cronista',                description: 'Registrou 50 memórias',                       xp: 500,  icon: 'layers'     },
  { id: 'cem-memorias',       title: 'Guardião(ã) do Tempo',   description: 'Registrou 100 memórias',                      xp: 1000, icon: 'archive'    },
  // Fotos
  { id: 'primeira-foto',      title: 'Primeiro Clique',         description: 'Registrou a primeira foto',                   xp: 75,   icon: 'image'      },
  { id: 'fotografo',          title: 'Fotógrafo(a)',            description: 'Adicionou 5 fotos',                           xp: 150,  icon: 'camera'     },
  { id: 'dez-fotos',          title: 'Álbum Especial',          description: 'Registrou 10 fotos',                          xp: 200,  icon: 'image'      },
  { id: 'trinta-fotos',       title: 'Fotógrafo(a) Pro',        description: 'Registrou 30 fotos',                          xp: 400,  icon: 'camera'     },
  // Áudios
  { id: 'narrador',           title: 'Narrador(a)',             description: 'Gravou o primeiro áudio',                     xp: 100,  icon: 'mic'        },
  { id: 'cinco-audios',       title: 'Locutor(a)',              description: 'Gravou 5 áudios',                             xp: 250,  icon: 'mic'        },
  // Vídeos
  { id: 'primeiro-video',     title: 'Diretor(a)',              description: 'Gravou o primeiro vídeo',                     xp: 100,  icon: 'video'      },
  { id: 'cinco-videos',       title: 'Cineasta',                description: 'Gravou 5 vídeos',                             xp: 250,  icon: 'film'       },
  // Histórias
  { id: 'primeira-historia',  title: 'Contador(a) de Histórias', description: 'Escreveu a primeira história',              xp: 75,   icon: 'pen-line'   },
  { id: 'memoria-detalhada',  title: 'Detalhista',              description: 'Escreveu memória com mais de 300 palavras',   xp: 150,  icon: 'edit'       },
  // Sequências
  { id: 'semana-seguida',     title: 'Semana de Ouro',          description: 'Registrou memórias por 7 dias seguidos',      xp: 300,  icon: 'calendar'   },
  { id: 'marco-mes',          title: 'Marco do Mês',            description: 'Registrou memórias por 30 dias seguidos',     xp: 500,  icon: 'award'      },
  { id: 'tres-meses',         title: 'Constância Total',        description: 'Registrou memórias por 3 meses seguidos',     xp: 750,  icon: 'trophy'     },
  { id: 'albumzinho',         title: 'Álbum Completo',          description: 'Criou todos os tipos de memória (foto, vídeo, áudio e história)', xp: 400, icon: 'package' },
  // Família
  { id: 'primeiro-membro',    title: 'Família Presente',        description: 'Convidou o primeiro familiar',                xp: 100,  icon: 'users'      },
  { id: 'familia-unida',      title: 'Família Unida',           description: 'Convidou 3 familiares',                       xp: 250,  icon: 'users'      },
  { id: 'grande-familia',     title: 'Grande Família',          description: 'Convidou 5 familiares',                       xp: 400,  icon: 'users'      },
  { id: 'familia-completa',   title: 'Família Completa',        description: 'Convidou 10 ou mais familiares',              xp: 750,  icon: 'home'       },
  { id: 'voz-familia',        title: 'Vozes da Família',        description: '3 familiares participaram ativamente',        xp: 300,  icon: 'message-circle' },
  { id: 'raizes-vivas',       title: 'Raízes Vivas',            description: '5 familiares participaram ativamente',        xp: 500,  icon: 'heart'      },
  // Mensagens do futuro
  { id: 'mensagem-tempo',     title: 'Mensagem no Tempo',       description: 'Criou uma mensagem para o futuro',            xp: 250,  icon: 'clock'      },
  { id: 'tres-mensagens',     title: 'Viajante do Tempo',       description: 'Criou 3 mensagens para o futuro',             xp: 400,  icon: 'clock'      },
  { id: 'cinco-mensagens',    title: 'Oráculo',                 description: 'Criou 5 mensagens para o futuro',             xp: 600,  icon: 'clock'      },
  { id: 'mensagem-1-ano',     title: 'Para Meu Bebê de 1 Ano',  description: 'Escreveu mensagem para os 12 meses de idade', xp: 200,  icon: 'gift'       },
  { id: 'mensagem-18-anos',   title: 'Para a Vida Adulta',      description: 'Escreveu mensagem para os 18 anos',           xp: 300,  icon: 'gift'       },
  { id: 'mensagem-formatura', title: 'Para a Formatura',        description: 'Escreveu mensagem para a formatura',          xp: 300,  icon: 'book'       },
  // Marcos de vida
  { id: 'primeiro-mes',       title: 'Primeiro Mês!',           description: 'Registrou o primeiro mês de vida',            xp: 100,  icon: 'calendar'   },
  { id: 'seis-meses-vida',    title: 'Seis Meses de Alegria',   description: 'Celebrou 6 meses de vida',                   xp: 200,  icon: 'star'       },
  { id: 'primeiro-ano',       title: 'Feliz 1 Ano!',            description: 'Celebrou o primeiro aniversário',             xp: 500,  icon: 'gift'       },
  { id: 'segundo-ano',        title: 'Feliz 2 Anos!',           description: 'Celebrou o segundo aniversário',              xp: 600,  icon: 'gift'       },
  { id: 'terceiro-ano',       title: 'Feliz 3 Anos!',           description: 'Celebrou o terceiro aniversário',             xp: 800,  icon: 'gift'       },
  { id: 'quinto-ano',         title: 'Feliz 5 Anos!',           description: 'Celebrou o quinto aniversário',               xp: 1000, icon: 'award'      },
  // Marcos do bebê
  { id: 'primeiros-passos',   title: 'Primeiros Passinhos',     description: 'Registrou os primeiros passos',               xp: 300,  icon: 'heart'      },
  { id: 'primeira-palavra',   title: 'Primeira Palavra',        description: 'Registrou a primeira palavrinha',             xp: 300,  icon: 'message-circle' },
  { id: 'primeiro-sorriso',   title: 'Primeiro Sorriso',        description: 'Registrou o primeiro sorriso',                xp: 200,  icon: 'heart'      },
  { id: 'primeiro-dente',     title: 'Dentinho!',               description: 'Registrou o primeiro dentinho',               xp: 200,  icon: 'star'       },
  { id: 'primeiro-natal',     title: 'Primeiro Natal',          description: 'Registrou o Natal do bebê',                  xp: 300,  icon: 'gift'       },
  // Perfil e app
  { id: 'perfil-completo',    title: 'Perfil Completo',         description: 'Completou o perfil do bebê',                 xp: 150,  icon: 'user'       },
  { id: 'foto-perfil',        title: 'Rosto do Amor',           description: 'Adicionou foto de perfil do bebê',            xp: 100,  icon: 'user'       },
  { id: 'explorador',         title: 'Explorador(a)',           description: 'Explorou todas as seções do app',             xp: 200,  icon: 'map'        },
  // XP milestones
  { id: 'guardiao-memorias',  title: 'Guardião(ã) das Memórias', description: 'Acumulou 1.000 XP',                        xp: 300,  icon: 'shield'     },
  { id: 'lenda-viva',         title: 'Lenda Viva',              description: 'Acumulou 5.000 XP',                          xp: 1000, icon: 'zap'        },
  { id: 'madrugada-amor',     title: 'Madrugada de Amor',       description: 'Registrou uma memória de madrugada',         xp: 150,  icon: 'moon'       },
  { id: 'presente-eterno',    title: 'Presente Eterno',         description: 'Acumulou 10.000 XP',                         xp: 500,  icon: 'gift'       },
  { id: 'arvore-plena',       title: 'Árvore Plena',            description: 'Atingiu o Nível 50 na Árvore da Vida',       xp: 0,    icon: 'tree-pine'  },
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
