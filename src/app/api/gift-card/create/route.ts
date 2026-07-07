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

// Charset sem caracteres ambíguos (sem 0, O, 1, I)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const seg = () =>
    Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
  return `${seg()}-${seg()}-${seg()}-${seg()}`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { amount, senderName, message } = await req.json() as {
      amount: number
      senderName?: string
      message?: string
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    const admin = adminClient()

    // Gera código único — tenta até 3 vezes em caso de colisão
    let code = ''
    for (let i = 0; i < 3; i++) {
      const candidate = generateCode()
      const { data } = await admin.from('gift_cards').select('id').eq('code', candidate).maybeSingle()
      if (!data) { code = candidate; break }
    }
    if (!code) return NextResponse.json({ error: 'Erro ao gerar código único' }, { status: 500 })

    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const { error } = await admin.from('gift_cards').insert({
      code,
      amount,
      sender_name: senderName?.trim() || user.email || 'Memora Bebê',
      message: message?.trim() || null,
      redeemed: false,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error('[gift-card/create]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Gift card criado: ${code} R$${amount} by ${user.id}`)
    return NextResponse.json({ success: true, code, amount })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
