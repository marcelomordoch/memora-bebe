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

// Parses a YYYY-MM-DD string as local time (avoids UTC-offset day-shift)
export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatLocalDate(dateStr: string): string {
  return parseDateLocal(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
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
  'ano-1':    'linear-gradient(135deg,#E7AFD6,#C76FB0)',
  'ano-2':    'linear-gradient(135deg,#81C7E8,#4A8FBB)',
  'ano-3':    'linear-gradient(135deg,#F9D876,#E8A830)',
  'ano-4':    'linear-gradient(135deg,#A8E6CF,#3D9970)',
  'ano-5':    'linear-gradient(135deg,#FFD3A5,#E67E22)',
  // Legacy keys (kept for backward compatibility with memories already saved)
  '0-1':    'linear-gradient(135deg,#E7AFD6,#C76FB0)',
  '1-3':    'linear-gradient(135deg,#81C7E8,#4A8FBB)',
  'escola': 'linear-gradient(135deg,#F9D876,#E8A830)',
}

export const MEMORY_EMOJIS: Record<string, string[]> = {
  'gestacao': ['🤰','👶','💜','🌸','⭐'],
  'ano-1':    ['🍼','😊','👣','🎀','💕'],
  'ano-2':    ['🚶','🎨','🌈','🎉','🧸'],
  'ano-3':    ['🏃','✏️','📚','🎭','🎪'],
  'ano-4':    ['🎒','🌟','🏆','🎯','🎠'],
  'ano-5':    ['⚽','🎸','🌍','🚀','💡'],
}

// Computes the life stage key from a memory's timestamp and the baby's birth date.
// Returns 'gestacao' if before birth, 'ano-N' for the Nth year of life.
export function getLifeStage(createdAt: string, birthDate: string | undefined | null): string {
  if (!birthDate) return 'gestacao'
  const created = new Date(createdAt)
  const birth = parseDateLocal(birthDate)
  if (created < birth) return 'gestacao'
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25
  const ageYears = (created.getTime() - birth.getTime()) / msPerYear
  return `ano-${Math.floor(ageYears) + 1}`
}

// Human-readable label for a life stage key.
export function lifeStageLabel(stage: string): string {
  if (stage === 'gestacao') return 'Gestação'
  if (stage.startsWith('ano-')) return `${stage.slice(4)}º Ano`
  return stage
}

// Returns the baby's age at the moment of a memory (e.g. "Gestação", "3 meses", "1 ano e 2 meses", "3 anos").
export function babyAgeAtMemory(createdAt: string, birthDate: string | undefined | null): string {
  if (!birthDate) return ''
  const created = new Date(createdAt)
  const birth = parseDateLocal(birthDate)
  if (created < birth) return 'Gestação'
  const totalMonths = Math.floor((created.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (years === 0) return months <= 1 ? '1 mês' : `${months} meses`
  if (months === 0) return years === 1 ? '1 ano' : `${years} anos`
  const mos = months === 1 ? '1 mês' : `${months} meses`
  return years === 1 ? `1 ano e ${mos}` : `${years} anos e ${mos}`
}

export function generateGiftCode(): string {
  return Array.from({length: 4}, () =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  ).join('-')
}

/**
 * Calcula a semana atual da gestação a partir da data prevista do parto.
 * Uma gestação a termo tem 40 semanas.
 * Se não houver due_date, usa o campo week manual.
 */
export function calculateCurrentWeek(baby: { due_date?: string; week?: number; status?: string }): number {
  if (baby.status === 'nascido') return 40

  if (baby.due_date) {
    const now = new Date()
    const due = new Date(baby.due_date)
    const msPerWeek = 1000 * 60 * 60 * 24 * 7
    const weeksUntilDue = (due.getTime() - now.getTime()) / msPerWeek
    const currentWeek = Math.round(40 - weeksUntilDue)
    return Math.max(1, Math.min(42, currentWeek))
  }

  return baby.week ?? 0
}

/**
 * Calcula quantas semanas faltam para o parto.
 */
export function weeksUntilDue(baby: { due_date?: string; week?: number }): number {
  if (baby.due_date) {
    const now = new Date()
    const due = new Date(baby.due_date)
    const msPerWeek = 1000 * 60 * 60 * 24 * 7
    return Math.max(0, Math.round((due.getTime() - now.getTime()) / msPerWeek))
  }
  return Math.max(0, 40 - (baby.week ?? 0))
}
