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
  free: 1, basico: 5, familia: 15, memorias: 30, premium: 60, pro: 100,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { newPlan, creditBrl } = await req.json() as { newPlan: string; creditBrl: number }

    const storageLimitGb = PLAN_STORAGE[newPlan] ?? 1
    const admin = adminClient()

    // Busca crédito atual para somar
    const { data: profile } = await admin
      .from('profiles')
      .select('account_credit_brl')
      .eq('id', user.id)
      .single()

    const existingCredit = profile?.account_credit_brl ?? 0
    const totalCredit = Math.round((existingCredit + creditBrl) * 100) / 100

    const { error } = await admin
      .from('profiles')
      .update({
        plan: newPlan === 'free' ? 'free' : 'premium',
        storage_plan: newPlan,
        storage_limit_gb: storageLimitGb,
        plan_expires_at: null,         // plano downgraded não tem expiração por enquanto
        account_credit_brl: totalCredit,
      })
      .eq('id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    console.log(`⬇️ Downgrade: ${user.id} → ${newPlan}, crédito gerado: R$ ${creditBrl.toFixed(2)}, total: R$ ${totalCredit.toFixed(2)}`)
    return NextResponse.json({ success: true, newPlan, storageLimitGb, totalCredit })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
