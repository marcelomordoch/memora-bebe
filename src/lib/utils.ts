import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff/60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`
  return `${Math.floor(diff/86400)}d atrás`
}

export const MEMORY_COLORS: Record<string, string> = {
  'gestacao': 'linear-gradient(135deg,#B79BD8,#6B53AE)',
  '0-1':      'linear-gradient(135deg,#E7AFD6,#C76FB0)',
  '1-3':      'linear-gradient(135deg,#81C7E8,#4A8FBB)',
  'escola':   'linear-gradient(135deg,#F9D876,#E8A830)',
}

export const MEMORY_EMOJIS: Record<string, string[]> = {
  'gestacao': ['🤰','👶','💜','🌸','⭐'],
  '0-1':      ['🍼','😊','👣','🎀','💕'],
  '1-3':      ['🚶','🎨','📚','🌈','🎉'],
  'escola':   ['🎒','✏️','📖','🌟','🏆'],
}

export function generateGiftCode(): string {
  return Array.from({length: 4}, () =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  ).join('-')
}
