import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getR2Client, R2_BUCKET, getPublicUrl } from '@/lib/r2/client'

// Index maps to likelihood level returned by Vision API
const LEVEL = ['UNKNOWN', 'VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY']
const BLOCK_AT = 4 // LIKELY or VERY_LIKELY

async function deleteFromR2(key: string) {
  try {
    const r2 = getR2Client()
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  } catch (err) {
    console.error('[vision-scan] R2 delete error:', err)
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { key } = await req.json()
  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'key obrigatório' }, { status: 400 })
  }

  // Only scan image files (skip video/audio)
  const imageExtensions = /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i
  if (!imageExtensions.test(key)) {
    return NextResponse.json({ ok: true })
  }

  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) {
    console.warn('[vision-scan] GOOGLE_VISION_API_KEY not set — skipping scan')
    return NextResponse.json({ ok: true })
  }

  const imageUri = getPublicUrl(key)

  let visionRes: Response
  try {
    visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { source: { imageUri } },
            features: [{ type: 'SAFE_SEARCH_DETECTION' }],
          }],
        }),
      }
    )
  } catch (err) {
    // Network error calling Vision API — fail open so a Vision outage doesn't block users
    console.error('[vision-scan] Vision API unreachable:', err)
    return NextResponse.json({ ok: true })
  }

  if (!visionRes.ok) {
    console.error('[vision-scan] Vision API HTTP error:', visionRes.status, await visionRes.text())
    return NextResponse.json({ ok: true }) // fail open
  }

  const body = await visionRes.json()
  const annotation = body.responses?.[0]?.safeSearchAnnotation

  if (!annotation) {
    return NextResponse.json({ ok: true })
  }

  const adult    = LEVEL.indexOf(annotation.adult    ?? 'UNKNOWN')
  const violence = LEVEL.indexOf(annotation.violence ?? 'UNKNOWN')
  const racy     = LEVEL.indexOf(annotation.racy     ?? 'UNKNOWN')

  const blocked = adult >= BLOCK_AT || violence >= BLOCK_AT || racy >= BLOCK_AT

  if (blocked) {
    console.warn(`[vision-scan] Blocked upload — adult:${annotation.adult} violence:${annotation.violence} racy:${annotation.racy} key:${key}`)
    await deleteFromR2(key)
    return NextResponse.json(
      { error: 'Conteúdo não permitido detectado. A imagem foi removida.' },
      { status: 403 }
    )
  }

  return NextResponse.json({ ok: true })
}
