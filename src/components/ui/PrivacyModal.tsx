'use client'

import { useState, useEffect } from 'react'
import Icon from '@/components/ui/Icon'

const STORAGE_KEY = 'privacy_notice_seen'

export default function PrivacyModal() {
  const [visible, setVisible] = useState(false)
  const [dontShow, setDontShow] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== '1') {
      setVisible(true)
    }
  }, [])

  function handleClose() {
    if (dontShow) localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const items = [
    { icon: 'lock', label: 'Suas memórias são 100% privadas' },
    { icon: 'shield-check', label: 'Nenhum dado do bebê é compartilhado' },
    { icon: 'eye-off', label: 'Nenhum terceiro tem acesso ao conteúdo' },
    { icon: 'server', label: 'Armazenamento seguro e criptografado' },
  ]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(18,17,26,0.65)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '0 0 env(safe-area-inset-bottom,0)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '28px 24px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#EDE9FE,#D1C4F5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon name="shield-check" size={30} color="#6B53AE" strokeWidth={1.8} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              fontSize: 19,
              color: '#2E2C4A',
              margin: '0 0 6px',
            }}>
              Suas memórias estão seguras
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: '#8B89B0',
              margin: 0,
              lineHeight: 1.5,
            }}>
              O Memora Bebê foi criado para guardar momentos com total privacidade.
            </p>
          </div>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.icon} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: '#F5F2FF',
              borderRadius: 14,
              padding: '12px 16px',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#EDE9FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={item.icon} size={18} color="#6B53AE" strokeWidth={1.8} />
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                color: '#2E2C4A',
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Don't show again */}
        <button
          onClick={() => setDontShow(d => !d)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            alignSelf: 'center',
          }}
        >
          <div style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            border: dontShow ? 'none' : '2px solid #C4B8E8',
            background: dontShow ? '#6B53AE' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}>
            {dontShow && <Icon name="check" size={13} color="#fff" strokeWidth={3} />}
          </div>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: '#8B89B0',
          }}>
            Não mostrar novamente
          </span>
        </button>

        {/* CTA */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg,#B79BD8,#6B53AE,#4E4490)',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(107,83,174,0.35)',
          }}
        >
          Entendi, continuar
        </button>
      </div>
    </div>
  )
}
