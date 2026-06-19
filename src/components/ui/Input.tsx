'use client'

import { InputHTMLAttributes, useState } from 'react'
import Icon from './Icon'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, type, className, ...props }: InputProps) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          color: 'var(--text-strong)',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && showPass ? 'text' : type}
          style={{
            width: '100%', padding: '13px 14px',
            paddingRight: isPassword ? 44 : 14,
            border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-strong)'}`,
            borderRadius: 14, fontSize: 15,
            fontFamily: 'var(--font-body)',
            color: 'var(--text-strong)',
            background: '#fff',
            transition: 'border-color 150ms ease',
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            }}
          >
            <Icon name={showPass ? 'eye-off' : 'eye'} size={18} />
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function TextArea({ label, ...props }: TextAreaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          color: 'var(--text-strong)',
        }}>
          {label}
        </label>
      )}
      <textarea
        rows={4}
        style={{
          width: '100%', padding: '13px 14px',
          border: '1.5px solid var(--border-strong)',
          borderRadius: 14, fontSize: 15, resize: 'none',
          fontFamily: 'var(--font-body)', color: 'var(--text-strong)', background: '#fff',
        }}
        {...props}
      />
    </div>
  )
}
