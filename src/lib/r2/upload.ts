import { compressImage } from './compress'

export interface UploadResult {
  url: string
  sizeBytes: number
}

export async function uploadToR2(
  file: File,
  folder: 'memories' | 'videos' | 'audio' | 'babies'
): Promise<UploadResult> {
  // Compress images before upload (videos/audio pass through unchanged)
  const toUpload = await compressImage(file)

  // 1. Request presigned URL from backend
  const presignRes = await fetch('/api/r2-presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: toUpload.name,
      contentType: toUpload.type || 'application/octet-stream',
      folder,
    }),
  })

  const presignData = await presignRes.json()
  if (!presignRes.ok || presignData.error) {
    throw new Error(presignData.error || 'Erro ao gerar URL de upload')
  }

  const { uploadUrl, publicUrl, key } = presignData

  // 2. Upload directly to R2 via presigned URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': toUpload.type || 'application/octet-stream' },
    body: toUpload,
  })

  if (!uploadRes.ok) {
    throw new Error(`Falha no upload para o R2 (status ${uploadRes.status})`)
  }

  // 3. Google Vision Safe Search scan (images only — video/audio skipped server-side)
  const scanRes = await fetch('/api/vision-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  })

  const scanData = await scanRes.json()
  if (!scanRes.ok || scanData.error) {
    throw new Error(scanData.error || 'Conteúdo não permitido.')
  }

  return { url: publicUrl, sizeBytes: toUpload.size }
}
