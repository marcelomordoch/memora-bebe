'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { User, Baby, Plan } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile, getBaby, signOut } from '@/lib/supabase/queries'

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [baby, setBaby] = useState<Baby | null>(null)
  const [plan, setPlan] = useState<Plan>('free')
  const [isLoading, setIsLoading] = useState(true)

  const loadUserData = useCallback(async (authUserId: string) => {
    try {
      const profile = await getCurrentProfile()
      if (profile) {
        const appUser: User = {
          id: profile.id,
          email: profile.email ?? '',
          name: profile.name ?? '',
          plan: (profile.plan as Plan) ?? 'free',
          created_at: profile.created_at,
        }
        setUser(appUser)
        setPlan(appUser.plan)
      }
      const babyData = await getBaby(authUserId)
      setBaby(babyData)
    } catch (err) {
      console.error('Failed to load user data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUserData(session.user.id)
        } else {
          setUser(null)
          setBaby(null)
          setPlan('free')
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserData])

  const handleSetPlan = useCallback((p: Plan) => {
    setPlan(p)
    setUser(prev => prev ? { ...prev, plan: p } : prev)
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setBaby(null)
      setPlan('free')
    }
  }, [])

  return (
    <AppContext.Provider value={{
      user, baby, plan, isLoading,
      setUser, setBaby,
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
