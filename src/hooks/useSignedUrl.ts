'use client'

import { useState, useEffect } from 'react'

// Module-level cache: clean url → { signed, expiresAt }
const cache = new Map<string, { signed: string; expiresAt: number }>()
// Dedup in-flight requests for the same key
const inflight = new Map<string, Promise<string>>()

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '')

function isR2Url(url: string): boolean {
  return !!R2_BASE && url.startsWith(R2_BASE)
}

async function fetchSigned(rawUrl: string): Promise<string> {
  const hashIdx = rawUrl.indexOf('#')
  const cleanUrl = hashIdx >= 0 ? rawUrl.slice(0, hashIdx) : rawUrl
  const suffix = hashIdx >= 0 ? rawUrl.slice(hashIdx) : ''

  const cached = cache.get(cleanUrl)
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.signed + suffix

  if (!inflight.has(cleanUrl)) {
    const p = fetch(`/api/r2-sign?url=${encodeURIComponent(cleanUrl)}`)
      .then(r => r.json())
      .then((data: { url?: string }) => {
        if (!data.url) throw new Error('no url')
        cache.set(cleanUrl, { signed: data.url, expiresAt: Date.now() + 3_500_000 }) // ~58min
        inflight.delete(cleanUrl)
        return data.url
      })
      .catch(err => { inflight.delete(cleanUrl); throw err })
    inflight.set(cleanUrl, p)
  }

  return (await inflight.get(cleanUrl)!) + suffix
}

export function useSignedUrl(url: string | null | undefined): string | undefined {
  const getInitial = (): string | undefined => {
    if (!url) return undefined
    const hashIdx = url.indexOf('#')
    const cleanUrl = hashIdx >= 0 ? url.slice(0, hashIdx) : url
    if (!isR2Url(cleanUrl)) return url
    const suffix = hashIdx >= 0 ? url.slice(hashIdx) : ''
    const cached = cache.get(cleanUrl)
    if (cached && cached.expiresAt > Date.now() + 60_000) return cached.signed + suffix
    return undefined
  }

  const [signed, setSigned] = useState<string | undefined>(getInitial)

  useEffect(() => {
    if (!url) { setSigned(undefined); return }
    const hashIdx = url.indexOf('#')
    const cleanUrl = hashIdx >= 0 ? url.slice(0, hashIdx) : url
    if (!isR2Url(cleanUrl)) { setSigned(url); return }

    let cancelled = false
    fetchSigned(url)
      .then(s => { if (!cancelled) setSigned(s) })
      .catch(() => { if (!cancelled) setSigned(url) }) // fallback on error
    return () => { cancelled = true }
  }, [url])

  return signed
}
