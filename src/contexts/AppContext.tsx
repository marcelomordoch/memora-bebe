'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, Baby, Plan } from '@/types'

interface AppState {
  user: User | null
  baby: Baby | null
  plan: Plan
  isLoading: boolean
  setUser: (u: User | null) => void
  setBaby: (b: Baby | null) => void
  setPlan: (p: Plan) => void
  logout: () => void
}

const AppContext = createContext<AppState | null>(null)

const DEMO_USER: User = {
  id: 'demo-1',
  email: 'demo@memorabebe.com.br',
  name: 'Juliana',
  plan: 'free',
  created_at: new Date().toISOString(),
}

const DEMO_BABY: Baby = {
  id: 'baby-1',
  user_id: 'demo-1',
  name: 'Sofia',
  gender: 'menina',
  status: 'gestacao',
  week: 24,
  due_date: new Date(Date.now() + 86400000 * 112).toISOString(),
  about: 'Nossa princesinha que está chegando cheinha de amor e alegria! 💜',
  created_at: new Date().toISOString(),
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [baby, setBaby] = useState<Baby | null>(null)
  const [plan, setPlan] = useState<Plan>('free')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Restore session from localStorage (demo mode)
    const saved = localStorage.getItem('mb_session')
    if (saved) {
      try {
        const { user: u, baby: b, plan: p } = JSON.parse(saved)
        setUser(u)
        setBaby(b)
        setPlan(p || 'free')
      } catch {}
    }
    setIsLoading(false)
  }, [])

  const handleSetUser = (u: User | null) => {
    setUser(u)
    if (u) {
      const current = localStorage.getItem('mb_session')
      const parsed = current ? JSON.parse(current) : {}
      localStorage.setItem('mb_session', JSON.stringify({ ...parsed, user: u }))
    }
  }

  const handleSetBaby = (b: Baby | null) => {
    setBaby(b)
    const current = localStorage.getItem('mb_session')
    const parsed = current ? JSON.parse(current) : {}
    localStorage.setItem('mb_session', JSON.stringify({ ...parsed, baby: b }))
  }

  const handleSetPlan = (p: Plan) => {
    setPlan(p)
    const current = localStorage.getItem('mb_session')
    const parsed = current ? JSON.parse(current) : {}
    localStorage.setItem('mb_session', JSON.stringify({ ...parsed, plan: p }))
    if (user) {
      const updatedUser = { ...user, plan: p }
      setUser(updatedUser)
      localStorage.setItem('mb_session', JSON.stringify({ ...parsed, plan: p, user: updatedUser }))
    }
  }

  const logout = () => {
    setUser(null)
    setBaby(null)
    setPlan('free')
    localStorage.removeItem('mb_session')
  }

  return (
    <AppContext.Provider value={{
      user, baby, plan, isLoading,
      setUser: handleSetUser,
      setBaby: handleSetBaby,
      setPlan: handleSetPlan,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export { DEMO_USER, DEMO_BABY }
