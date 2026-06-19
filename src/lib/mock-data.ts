import type { Memory, Achievement, FamilyMember, FutureMessage, GiftCard, Notification } from '@/types'

export const MOCK_MEMORIES: Memory[] = [
  {
    id: '1',
    baby_id: '1',
    user_id: '1',
    type: 'historia',
    title: 'Primeiro chute!',
    body: 'Hoje senti o primeiro chute da Sofia. Uma emoção indescritível, um momento que nunca vou esquecer. Ela me deu uma chutzinha às 22h enquanto eu assistia TV.',
    life_stage: 'gestacao',
    emoji: '🤰',
    bg_color: 'linear-gradient(135deg,#B79BD8,#6B53AE)',
    week: 20,
    likes_count: 12,
    liked_by_me: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2',
    baby_id: '1',
    user_id: '1',
    type: 'foto',
    title: 'Ultrassom 20 semanas',
    body: 'Vimos o rostinho dela pela primeira vez com mais clareza. Ela estava com a mãozinha no rosto, dormindo.',
    life_stage: 'gestacao',
    emoji: '👶',
    bg_color: 'linear-gradient(135deg,#B79BD8,#6B53AE)',
    week: 20,
    likes_count: 24,
    liked_by_me: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: '3',
    baby_id: '1',
    user_id: '1',
    type: 'historia',
    title: 'Decorando o quarto',
    body: 'Passamos o fim de semana montando o berço e decorando o quartinho. Ficou lindo, cheio de amor em cada detalhe.',
    life_stage: 'gestacao',
    emoji: '🌸',
    bg_color: 'linear-gradient(135deg,#B79BD8,#6B53AE)',
    week: 28,
    likes_count: 8,
    liked_by_me: false,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Primeira Memória', description: 'Registrou sua primeira memória', xp: 50, icon: 'star', unlocked: true, unlocked_at: new Date().toISOString() },
  { id: '2', title: 'Família Conectada', description: 'Convidou um familiar', xp: 100, icon: 'users', unlocked: true, unlocked_at: new Date().toISOString() },
  { id: '3', title: 'Escritor(a)', description: 'Registrou 10 memórias', xp: 200, icon: 'file-text', unlocked: false },
  { id: '4', title: 'Fotógrafo(a)', description: 'Adicionou 5 fotos', xp: 150, icon: 'camera', unlocked: false },
  { id: '5', title: 'Mensagem no Tempo', description: 'Criou uma mensagem para o futuro', xp: 250, icon: 'clock', unlocked: false },
  { id: '6', title: 'Marco do Mês', description: 'Registrou memórias por 30 dias seguidos', xp: 500, icon: 'award', unlocked: false },
]

export const MOCK_FAMILY: FamilyMember[] = [
  { id: '1', baby_id: '1', user_id: '2', name: 'Ana Paula', email: 'ana@email.com', status: 'accepted', role: 'parent', created_at: new Date().toISOString() },
  { id: '2', baby_id: '1', user_id: '3', name: 'Vó Maria', email: 'maria@email.com', status: 'accepted', role: 'grandparent', created_at: new Date().toISOString() },
  { id: '3', baby_id: '1', user_id: '4', name: 'Tia Carla', email: 'carla@email.com', status: 'pending', role: 'other', created_at: new Date().toISOString() },
]

export const MOCK_FUTURE_MESSAGES: FutureMessage[] = [
  { id: '1', baby_id: '1', user_id: '1', title: 'Para você aos 5 anos', body: 'Minha linda filha, quando você abrir essa mensagem, já estará começando a descobrir o mundo...', open_at_age: 5, created_at: new Date().toISOString() },
  { id: '2', baby_id: '1', user_id: '1', title: 'Para você aos 10 anos', body: 'Você já está crescendo tão rápido! Quero te contar como era quando você deu seus primeiros passos...', open_at_age: 10, created_at: new Date().toISOString() },
  { id: '3', baby_id: '1', user_id: '1', title: 'Para você aos 18 anos', body: 'Hoje você é uma pessoa adulta. Que jornada incrível foi acompanhar cada momento seu...', open_at_age: 18, created_at: new Date().toISOString() },
]

export const MOCK_GIFT_CARD: GiftCard = {
  id: '1',
  code: 'MBVH-K2NP-W8TR-X4QJ',
  amount: 49.90,
  sender_name: 'Vó Maria',
  message: 'Para eternizar cada memória da nossa bebezinha! Com muito amor 💜',
  redeemed: false,
  created_at: new Date().toISOString(),
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', user_id: '1', type: 'memory', title: 'Nova memória curtida', body: 'Ana Paula curtiu "Primeiro chute!"', read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', user_id: '1', type: 'milestone', title: 'Marco alcançado!', body: 'Sofia completou 20 semanas de gestação 🎉', read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', user_id: '1', type: 'family', title: 'Vó Maria reagiu', body: 'Vó Maria adorou a foto do ultrassom', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', user_id: '1', type: 'offer', title: 'Oferta especial!', body: '50% off no plano Premium por tempo limitado', read: true, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
]
