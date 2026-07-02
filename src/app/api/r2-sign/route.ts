import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getR2Client, R2_BUCKET } from '@/lib/r2/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const url = req.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'url obrigatória' }, { status: 400 })

    const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '')
    if (!base || !url.startsWith(base)) {
      return NextResponse.json({ error: 'URL não permitida' }, { status: 400 })
    }

    const key = url.slice(base.length + 1)

    const client = getR2Client()
    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key })
    const signed = await getSignedUrl(client, command, { expiresIn: 3600 })

    return NextResponse.json({ url: signed }, {
      headers: { 'Cache-Control': 'private, max-age=3400' },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[r2-sign]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
