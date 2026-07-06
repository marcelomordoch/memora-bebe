import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

const PLAN_STORAGE: Record<string, number> = {
  free:      1,
  basico:    5,
  familia:   15,
  memorias:  30,
  premium:   60,
  pro:       100,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { billing = 'monthly', plan = 'premium' } = await req.json().catch(() => ({}))

    const days = billing === 'yearly' ? 365 : 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    const storageLimitGb = PLAN_STORAGE[plan] ?? PLAN_STORAGE['premium']

    const admin = adminClient()
    const { error } = await admin
      .from('profiles')
      .update({
        plan: plan === 'free' ? 'free' : 'premium',
        storage_plan: plan,
        storage_limit_gb: storageLimitGb,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('[upgrade]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Upgrade: ${user.id} → ${plan} (${storageLimitGb}GB) até ${expiresAt.toISOString()}`)
    return NextResponse.json({ success: true, plan, storageLimitGb, expiresAt: expiresAt.toISOString() })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
