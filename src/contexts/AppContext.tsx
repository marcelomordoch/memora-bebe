'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { User, Baby, Plan } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { getBaby, signOut } from '@/lib/supabase/queries'
import PrivacyModal from '@/components/ui/PrivacyModal'
import TutorialModal from '@/components/ui/TutorialModal'

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

  const loadUserData = useCallback(async (authUser: { id: string; email?: string; user_metadata?: Record<string, string> }) => {
    try {
      const supabase = createClient()

      // Buscar perfil — email vem do auth, não do profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, plan, storage_plan, storage_limit_gb, account_credit_brl, plan_expires_at, created_at')
        .eq('id', authUser.id)
        .single()

      const appUser: User = {
        id: authUser.id,
        email: authUser.email ?? '',
        name: profile?.name ?? authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? '',
        plan: (profile?.plan as Plan) ?? 'free',
        storage_plan: profile?.storage_plan ?? 'free',
        storage_limit_gb: profile?.storage_limit_gb ?? 1,
        account_credit_brl: profile?.account_credit_brl ?? 0,
        plan_expires_at: profile?.plan_expires_at ?? undefined,
        created_at: profile?.created_at ?? new Date().toISOString(),
      }
      setUser(appUser)
      setPlan(appUser.plan)

      // Buscar bebê — não sobrescreve um baby temporário do wizard (id vazio)
      const babyData = await getBaby(authUser.id)
      setBaby(prev => {
        if (babyData) return babyData
        if (prev && prev.id === '') return prev  // wizard em andamento
        return null
      })
    } catch (err) {
      console.error('[AppContext] loadUserData error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        })
      } else {
        setIsLoading(false)
      }
    })

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        })
      } else {
        setUser(null)
        setBaby(null)
        setPlan('free')
        setIsLoading(false)
      }
    })

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
      console.error('[AppContext] logout error:', err)
    } finally {
      window.location.replace('/login')
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
      {user && <PrivacyModal />}
      {user && baby?.id && <TutorialModal />}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
