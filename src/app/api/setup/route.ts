import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Admin client com service role — ignora RLS
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    // Verificar sessão do usuário
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { name, gender, status, due_date, birth_date, week, about } = body

    if (!name || !gender || !status) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const admin = adminClient()

    // 1. Garantir que o perfil existe (upsert como admin)
    const displayName = user.user_metadata?.name || name || user.email?.split('@')[0] || 'Usuária'
    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: user.id,
        name: displayName,
        email: user.email,
        plan: 'free',
      },
      { onConflict: 'id' }
    )
    if (profileError) {
      console.error('[setup] profile upsert error:', profileError)
      return NextResponse.json({ error: `Erro ao criar perfil: ${profileError.message}` }, { status: 500 })
    }

    // 2. Criar o bebê (como admin)
    const babyPayload: Record<string, unknown> = {
      user_id: user.id,
      name,
      gender,
      status,
      about: about || null,
    }
    if (due_date) babyPayload.due_date = due_date
    if (birth_date) babyPayload.birth_date = birth_date
    if (week) babyPayload.week = week

    const { data: baby, error: babyError } = await admin
      .from('babies')
      .insert(babyPayload)
      .select()
      .single()

    if (babyError) {
      console.error('[setup] baby insert error:', babyError)
      return NextResponse.json({ error: `Erro ao criar bebê: ${babyError.message}` }, { status: 500 })
    }

    return NextResponse.json({ baby })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[setup] unexpected error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
