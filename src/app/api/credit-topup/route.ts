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
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { amount } = await req.json() as { amount: number }
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })

    const admin = adminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('account_credit_brl')
      .eq('id', user.id)
      .single()

    const existingCredit = profile?.account_credit_brl ?? 0
    const newTotal = Math.round((existingCredit + amount) * 100) / 100

    const { error } = await admin
      .from('profiles')
      .update({ account_credit_brl: newTotal })
      .eq('id', user.id)

    if (error) {
      console.error('[credit-topup]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Credit topup: ${user.id} +R$${amount} → R$${newTotal}`)
    return NextResponse.json({ success: true, newTotal })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
