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

    const { code } = await req.json() as { code: string }
    if (!code?.trim()) return NextResponse.json({ error: 'Código inválido.' }, { status: 400 })

    const admin = adminClient()
    const cleanCode = code.toUpperCase().trim()

    // Busca o gift card
    const { data: card, error: findErr } = await admin
      .from('gift_cards')
      .select('id, amount, redeemed, expires_at')
      .eq('code', cleanCode)
      .maybeSingle()

    if (findErr || !card) {
      return NextResponse.json({ error: 'Código inválido. Verifique e tente novamente.' }, { status: 400 })
    }
    if (card.redeemed) {
      return NextResponse.json({ error: 'Este gift card já foi utilizado.' }, { status: 400 })
    }
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este gift card está expirado.' }, { status: 400 })
    }

    // Marca como resgatado
    const { error: updateCardErr } = await admin
      .from('gift_cards')
      .update({ redeemed: true, redeemed_by: user.id, redeemed_at: new Date().toISOString() })
      .eq('id', card.id)

    if (updateCardErr) {
      console.error('[gift-card/redeem] updateCard:', updateCardErr)
      return NextResponse.json({ error: 'Erro ao resgatar. Tente novamente.' }, { status: 500 })
    }

    // Atualiza saldo do perfil
    const { data: profile } = await admin
      .from('profiles')
      .select('account_credit_brl')
      .eq('id', user.id)
      .single()

    const newTotal = Math.round(((profile?.account_credit_brl ?? 0) + card.amount) * 100) / 100

    await admin
      .from('profiles')
      .update({ account_credit_brl: newTotal })
      .eq('id', user.id)

    console.log(`✅ Gift card resgatado: ${cleanCode} +R$${card.amount} → saldo R$${newTotal} (user ${user.id})`)
    return NextResponse.json({ success: true, amount: card.amount, newTotal })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
