export type Plan = 'free' | 'premium'

export interface User {
  id: string
  email: string
  name: string
  plan: Plan
  storage_plan: string
  storage_limit_gb: number
  account_credit_brl: number
  plan_expires_at?: string
  created_at: string
}

export interface Baby {
  id: string
  user_id: string
  name: string
  gender: 'menino' | 'menina' | 'surpresa'
  status: 'gestacao' | 'nascido'
  birth_date?: string
  due_date?: string
  week?: number
  about?: string
  photo_url?: string
  created_at: string
}

export interface Memory {
  id: string
  baby_id: string
  user_id: string
  type: 'foto' | 'video' | 'audio' | 'historia'
  title: string
  body: string
  media_url?: string
  media_urls?: string[]
  week?: number
  life_stage: string
  emoji?: string
  bg_color?: string
  likes_count: number
  created_at: string
  liked_by_me?: boolean
  file_size_bytes?: number
}

export interface FamilyMember {
  id: string
  baby_id: string
  user_id: string
  name: string
  email?: string
  invited_email?: string
  status: 'pending' | 'accepted'
  role: 'parent' | 'grandparent' | 'other'
  invite_token?: string
  created_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  xp: number
  icon: string
  unlocked: boolean
  unlocked_at?: string
}

export interface FutureMessage {
  id: string
  baby_id: string
  user_id: string
  title: string
  body: string
  open_at_age: number
  audio_url?: string
  created_at: string
}

export interface GiftCard {
  id: string
  code: string
  amount: number
  sender_name: string
  message: string
  redeemed: boolean
  redeemed_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'memory' | 'milestone' | 'family' | 'offer' | 'system'
  title: string
  body: string
  read: boolean
  created_at: string
}
