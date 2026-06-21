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

export async function POST(req: NextRequest) {
  try {
    // Verificar sessão atual
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { billing = 'monthly' } = await req.json().catch(() => ({}))

    const days = billing === 'yearly' ? 365 : 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    const admin = adminClient()
    const { error } = await admin
      .from('profiles')
      .update({ plan: 'premium', plan_expires_at: expiresAt.toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('[upgrade]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Upgrade: ${user.id} → premium até ${expiresAt.toISOString()}`)
    return NextResponse.json({ success: true, plan: 'premium', expiresAt: expiresAt.toISOString() })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
