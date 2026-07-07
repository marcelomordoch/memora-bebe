import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getR2Client, R2_BUCKET } from '@/lib/r2/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { keys } = await req.json() as { keys: string[] }
    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ deleted: 0 })
    }

    const client = getR2Client()
    await Promise.allSettled(
      keys.map(key =>
        client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
      )
    )

    return NextResponse.json({ deleted: keys.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[r2-delete]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
