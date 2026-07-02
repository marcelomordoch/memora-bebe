'use client'

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const CORE_VERSION = '0.12.6'
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`

// Singleton — load once, reuse across uploads
let ffmpeg: FFmpeg | null = null
let loadPromise: Promise<void> | null = null

async function loadFFmpeg(onLoadProgress?: (p: number) => void): Promise<FFmpeg> {
  if (!ffmpeg) ffmpeg = new FFmpeg()
  if (ffmpeg.loaded) return ffmpeg

  if (!loadPromise) {
    loadPromise = (async () => {
      onLoadProgress?.(0)
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
      ])
      onLoadProgress?.(50)
      await ffmpeg!.load({ coreURL, wasmURL })
      onLoadProgress?.(100)
    })().finally(() => { loadPromise = null })
  }

  await loadPromise
  return ffmpeg
}

const MIN_SIZE_TO_COMPRESS = 10 * 1024 * 1024 // 10 MB

export async function compressVideo(
  file: File,
  onProgress: (stage: 'loading' | 'compressing', percent: number) => void
): Promise<File> {
  if (!file.type.startsWith('video/')) return file
  if (file.size < MIN_SIZE_TO_COMPRESS) return file

  const ff = await loadFFmpeg(p => onProgress('loading', p))

  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const inputName = `input.${ext}`
  const outputName = 'output.mp4'

  ff.on('progress', ({ progress }) => {
    onProgress('compressing', Math.min(99, Math.round(progress * 100)))
  })

  await ff.writeFile(inputName, await fetchFile(file))

  await ff.exec([
    '-i', inputName,
    '-c:v', 'libx264',
    '-crf', '28',             // quality: 18 = best, 28 = good balance, 51 = worst
    '-preset', 'fast',
    '-vf', "scale='min(1280,iw)':'-2'",  // max 1280px wide
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart', // moov atom first (web playback)
    '-y',
    outputName,
  ])

  const data = await ff.readFile(outputName)

  // Cleanup files from memory
  await ff.deleteFile(inputName).catch(() => {})
  await ff.deleteFile(outputName).catch(() => {})
  ff.off('progress', () => {})

  onProgress('compressing', 100)

  const blob = new Blob([data as Uint8Array], { type: 'video/mp4' })
  const name = file.name.replace(/\.[^.]+$/, '') + '.mp4'
  return new File([blob], name, { type: 'video/mp4' })
}
