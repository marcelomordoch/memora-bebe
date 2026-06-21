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

    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'Token inválido' }, { status: 400 })

    const admin = adminClient()

    // Verificar se o convite existe e está pendente
    const { data: invite, error: fetchErr } = await admin
      .from('family_members')
      .select('id, status, baby_id, name')
      .eq('invite_token', token)
      .single()

    if (fetchErr || !invite) {
      return NextResponse.json({ error: 'Convite não encontrado ou expirado' }, { status: 404 })
    }
    if (invite.status === 'accepted') {
      return NextResponse.json({ error: 'Convite já foi aceito' }, { status: 409 })
    }

    // Aceitar convite como admin (ignora RLS)
    const { error: updateErr } = await admin
      .from('family_members')
      .update({ status: 'accepted', user_id: user.id })
      .eq('id', invite.id)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Desbloquear conquista "familia-conectada" para quem aceitou o convite
    try {
      await admin.from('achievements').upsert(
        { baby_id: invite.baby_id, user_id: user.id, achievement_key: 'familia-conectada', xp: 100 },
        { onConflict: 'baby_id,achievement_key', ignoreDuplicates: true }
      )
    } catch { /* conquista não crítica */ }

    return NextResponse.json({ success: true, babyId: invite.baby_id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
