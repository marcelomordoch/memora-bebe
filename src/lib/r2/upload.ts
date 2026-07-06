import { compressImage } from './compress'

/**
 * Faz upload de um arquivo direto para o Cloudflare R2, sem passar pelo servidor Next.js.
 * Usa URL pré-assinada para evitar o limite de 4.5MB das funções serverless da Vercel.
 * Imagens são comprimidas no browser antes do upload (2048px, JPEG 85%).
 */
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

  // 1. Pedir URL pré-assinada ao backend
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

  const { uploadUrl, publicUrl } = presignData

  // 2. Upload direto para o R2 usando a URL pré-assinada
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': toUpload.type || 'application/octet-stream' },
    body: toUpload,
  })

  if (!uploadRes.ok) {
    throw new Error(`Falha no upload para o R2 (status ${uploadRes.status})`)
  }

  return { url: publicUrl, sizeBytes: toUpload.size }
}
