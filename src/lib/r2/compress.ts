const MAX_DIMENSION = 2048
const JPEG_QUALITY = 0.85

// Read EXIF orientation from the first bytes of a JPEG file
async function getExifOrientation(file: File): Promise<number> {
  try {
    const buf = await file.slice(0, 64 * 1024).arrayBuffer()
    const view = new DataView(buf)
    if (view.getUint16(0) !== 0xffd8) return 1 // not JPEG

    let offset = 2
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset)
      const segLen = view.getUint16(offset + 2)
      if (marker === 0xffe1) {
        // APP1 segment — may contain EXIF
        const exifHeader = String.fromCharCode(
          view.getUint8(offset + 4), view.getUint8(offset + 5),
          view.getUint8(offset + 6), view.getUint8(offset + 7)
        )
        if (exifHeader === 'Exif') {
          const tiffOffset = offset + 10
          const littleEndian = view.getUint16(tiffOffset) === 0x4949
          const ifdOffset = view.getUint32(tiffOffset + 4, littleEndian)
          const entryCount = view.getUint16(tiffOffset + ifdOffset, littleEndian)
          for (let i = 0; i < entryCount; i++) {
            const entryOffset = tiffOffset + ifdOffset + 2 + i * 12
            if (view.getUint16(entryOffset, littleEndian) === 0x0112) {
              return view.getUint16(entryOffset + 8, littleEndian)
            }
          }
        }
      }
      if ((marker & 0xff00) !== 0xff00) break
      offset += 2 + segLen
    }
  } catch { /* ignore */ }
  return 1
}

function orientCanvas(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  w: number,
  h: number
) {
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, w, 0); break
    case 3: ctx.transform(-1, 0, 0, -1, w, h); break
    case 4: ctx.transform(1, 0, 0, -1, 0, h); break
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break
    case 6: ctx.transform(0, 1, -1, 0, h, 0); break
    case 7: ctx.transform(0, -1, -1, 0, h, w); break
    case 8: ctx.transform(0, -1, 1, 0, 0, w); break
  }
}

export async function compressImage(file: File): Promise<File> {
  // Only compress images (not video/audio)
  if (!file.type.startsWith('image/')) return file

  const orientation = await getExifOrientation(file)
  const swapped = orientation >= 5 && orientation <= 8

  const bitmap = await createImageBitmap(file)
  const srcW = bitmap.width
  const srcH = bitmap.height

  // Scale down to MAX_DIMENSION if needed
  const scale = Math.min(1, MAX_DIMENSION / Math.max(srcW, srcH))
  const drawW = Math.round(srcW * scale)
  const drawH = Math.round(srcH * scale)

  // Canvas dimensions swap when orientation rotates 90°/270°
  const canvasW = swapped ? drawH : drawW
  const canvasH = swapped ? drawW : drawH

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')!
  orientCanvas(ctx, orientation, canvasW, canvasH)
  ctx.drawImage(bitmap, 0, 0, drawW, drawH)
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
