'use client'

import { useRouter } from 'next/navigation'
import Icon from './Icon'

interface ScreenHeaderProps {
  title?: string
  onBack?: () => void
  right?: React.ReactNode
  light?: boolean
  transparent?: boolean
}

export default function ScreenHeader({ title, onBack, right, light, transparent }: ScreenHeaderProps) {
  const router = useRouter()
  const c = light ? '#fff' : 'var(--text-strong)'
  const handleBack = onBack || (() => router.back())

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 20px 12px', flexShrink: 0,
      background: transparent ? 'transparent' : undefined,
    }}>
      <button
        onClick={handleBack}
        style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: light ? 'rgba(255,255,255,.18)' : 'var(--surface-sunken)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: c,
        }}
      >
        <Icon name="chevron-left" size={20} color={c} />
      </button>

      {title && (
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17,
          color: c, flex: 1, textAlign: 'center',
        }}>
          {title}
        </span>
      )}

      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
        {right}
      </div>
    </div>
  )
}
