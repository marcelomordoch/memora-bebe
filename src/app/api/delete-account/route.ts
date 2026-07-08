import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { getR2Client, R2_BUCKET } from '@/lib/r2/client'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function urlToKey(url: string): string | null {
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '')
  if (!base || !url.startsWith(base)) return null
  return url.slice(base.length + 1)
}

async function deleteR2Keys(keys: string[]) {
  if (keys.length === 0) return
  const client = getR2Client()
  // S3 DeleteObjects accepts max 1000 per call
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000)
    await client.send(new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: { Objects: batch.map(Key => ({ Key })) },
    }))
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const admin = adminClient()

    // 1. Collect all babies for this user
    const { data: babies } = await admin
      .from('babies')
      .select('id')
      .eq('user_id', user.id)

    const babyIds = (babies ?? []).map((b: { id: string }) => b.id)

    // 2. Collect all media URLs from memories before deleting
    const r2Keys: string[] = []

    if (babyIds.length > 0) {
      const { data: memories } = await admin
        .from('memories')
        .select('media_url, media_urls')
        .in('baby_id', babyIds)

      for (const m of memories ?? []) {
        if (m.media_url) {
          const key = urlToKey(m.media_url)
          if (key) r2Keys.push(key)
        }
        for (const u of m.media_urls ?? []) {
          const key = urlToKey(u)
          if (key) r2Keys.push(key)
        }
      }

      const { data: futureMessages } = await admin
        .from('future_messages')
        .select('audio_url')
        .in('baby_id', babyIds)

      for (const msg of futureMessages ?? []) {
        if (msg.audio_url) {
          const key = urlToKey(msg.audio_url)
          if (key) r2Keys.push(key)
        }
      }
    }

    // Baby photo
    const { data: babyData } = await admin
      .from('babies')
      .select('photo_url')
      .eq('user_id', user.id)

    for (const b of babyData ?? []) {
      if (b.photo_url) {
        const key = urlToKey(b.photo_url)
        if (key) r2Keys.push(key)
      }
    }

    // 3. Delete R2 files
    await deleteR2Keys(r2Keys)

    // 4. Delete all related DB records explicitly (safeguard if CASCADE not set)
    if (babyIds.length > 0) {
      await admin.from('achievements').delete().in('baby_id', babyIds)
      await admin.from('future_messages').delete().in('baby_id', babyIds)
      await admin.from('family_members').delete().in('baby_id', babyIds)
      await admin.from('memories').delete().in('baby_id', babyIds)
    }
    await admin.from('notifications').delete().eq('user_id', user.id)
    await admin.from('payments').delete().eq('user_id', user.id)
    // gift_cards.redeemed_by não tem CASCADE — limpar a referência antes de deletar o perfil
    await admin.from('gift_cards').update({ redeemed_by: null }).eq('redeemed_by', user.id)
    await admin.from('babies').delete().eq('user_id', user.id)
    await admin.from('profiles').delete().eq('id', user.id)

    // 5. Delete auth user (must be last)
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('[delete-account]', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[delete-account]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
