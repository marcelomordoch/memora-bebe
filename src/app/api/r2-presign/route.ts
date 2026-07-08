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

    // Check storage quota before generating upload URL
    const { data: profile } = await supabase.from('profiles').select('storage_limit_gb').eq('id', user.id).single()
    const limitBytes = (profile?.storage_limit_gb ?? 1) * 1024 * 1024 * 1024

    const { data: babies } = await supabase.from('babies').select('id').eq('user_id', user.id)
    const babyIds = (babies ?? []).map((b: { id: string }) => b.id)
    let usedBytes = 0
    if (babyIds.length > 0) {
      const { data: usage } = await supabase.from('memories').select('file_size_bytes').in('baby_id', babyIds)
      usedBytes = (usage ?? []).reduce((s: number, m: { file_size_bytes: number | null }) => s + (m.file_size_bytes ?? 0), 0)
    }

    if (usedBytes >= limitBytes) {
      return NextResponse.json(
        { error: `Armazenamento cheio (${(usedBytes / 1024 / 1024 / 1024).toFixed(2)} GB usados de ${profile?.storage_limit_gb ?? 1} GB). Faça upgrade para continuar.` },
        { status: 403 }
      )
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
