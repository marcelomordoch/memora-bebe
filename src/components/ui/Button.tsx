'use client'

import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  children,
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--font-display)', fontWeight: 700, transition: 'all 200ms ease',
    width: fullWidth ? '100%' : undefined,
  }

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '10px 16px', fontSize: 14 },
    md: { padding: '13px 20px', fontSize: 15 },
    lg: { padding: '15px 24px', fontSize: 16 },
  }

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: disabled || loading ? 'var(--border-strong)' : 'var(--gradient-brand)',
      color: '#fff',
      boxShadow: disabled || loading ? 'none' : 'var(--shadow-accent)',
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-strong)',
      border: '1.5px solid var(--border-strong)',
      boxShadow: 'var(--shadow-sm)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-accent)',
    },
    danger: {
      background: 'var(--danger)',
      color: '#fff',
    },
  }

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      className={className}
      {...props}
    >
      {loading ? (
        <span style={{
          width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)',
          borderTopColor: '#fff', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', display: 'inline-block',
        }} />
      ) : children}
    </button>
  )
}
