'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.push('/login'), 2500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div
      onClick={() => router.push('/login')}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff', cursor: 'pointer', userSelect: 'none',
      }}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="Memora Bebê" style={{ width: 200, objectFit: 'contain' }} />
        </div>

        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15,
          color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280,
          animationDelay: '200ms',
        }}
          className="animate-fade-in"
        >
          A memória emocional da infância.
        </p>
      </div>
    </div>
  )
}
