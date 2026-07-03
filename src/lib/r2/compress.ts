const MAX_DIMENSION = 2048
const JPEG_QUALITY = 0.85

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  // createImageBitmap with 'from-image' applies EXIF orientation automatically
  // (default in modern Chrome/Safari/Firefox), so the bitmap is already correctly rotated.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const srcW = bitmap.width
  const srcH = bitmap.height

  const scale = Math.min(1, MAX_DIMENSION / Math.max(srcW, srcH))
  const canvasW = Math.round(srcW * scale)
  const canvasH = Math.round(srcH * scale)

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvasW, canvasH)
  bitmap.close()

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) { reject(new Error('Canvas compression failed')); return }
        const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
        resolve(new File([blob], name, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      JPEG_QUALITY
    )
  })
}
