import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getR2Client, R2_BUCKET, getPublicUrl } from '@/lib/r2/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { fileName, contentType, folder } = await req.json()
    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'fileName e contentType são obrigatórios' }, { status: 400 })
    }

    const safeFolder = ['memories', 'videos', 'audio', 'babies'].includes(folder) ? folder : 'memories'
    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `${safeFolder}/${user.id}/${Date.now()}_${sanitized}`

    const client = getR2Client()
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }) // 5 min
    const publicUrl = getPublicUrl(key)

    return NextResponse.json({ uploadUrl, publicUrl, key })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[r2-presign]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
