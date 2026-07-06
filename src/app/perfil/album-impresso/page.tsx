'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import Icon from '@/components/ui/Icon'

// Cupom rastreável: ao negociar com a Phooto, forneça este código.
// Eles registram no sistema deles e pagam comissão por pedido que usar o cupom.
const COUPON = 'MEMORA15'
const DISCOUNT = '15%'

const BASE = 'https://www.phooto.com.br'
const UTM = 'utm_source=memorabebe&utm_medium=app&utm_campaign=parceria2025'

function phoootoUrl(path: string) {
  return `${BASE}${path}?${UTM}`
}

const SERVICES = [
  {
    icon: 'book-open',
    color: '#FEE2E2',
    iconColor: '#EF4444',
    title: 'Fotolivro',
    subtitle: 'Capa dura ou flexível',
    desc: 'Transforme as memórias do app em um livro físico lindo. Formatos quadrado, retrato e paisagem.',
    cta: 'Criar fotolivro',
    href: phoootoUrl('/fotolivros'),
    badge: 'Mais popular',
  },
  {
    icon: 'image',
    color: '#FEF3C7',
    iconColor: '#D97706',
    title: 'Revelação de Fotos',
    subtitle: 'Papel fosco ou brilhante',
    desc: 'Revele as melhores fotos do bebê em papel fotográfico de alta qualidade. A partir de R$ 0,49/foto.',
    cta: 'Revelar fotos',
    href: phoootoUrl('/revelacao'),
    badge: null,
  },
  {
    icon: 'layout',
    color: '#E0F2FE',
    iconColor: '#0284C7',
    title: 'Quadro Canvas',
    subtitle: 'Para decorar o quarto',
    desc: 'Impressão em tela canvas com moldura de madeira. Perfeito para o quartinho do bebê.',
    cta: 'Criar canvas',
    href: phoootoUrl('/foto-quadros/'),
    badge: null,
  },
  {
    icon: 'calendar',
    color: '#F0FDF4',
    iconColor: '#16A34A',
    title: 'Calendário',
    subtitle: 'Com as fotos do bebê',
    desc: 'Calendário personalizado mês a mês com as fotos mais especiais. Ótimo presente para avós.',
    cta: 'Criar calendário',
    href: phoootoUrl('/calendarios'),
    badge: null,
  },
  {
    icon: 'coffee',
    color: '#F5F3FF',
    iconColor: '#7C3AED',
    title: 'Caneca & Presentes',
    subtitle: 'Personalizado com as fotos',
    desc: 'Canecas, almofadas, quebra-cabeça e muito mais com a carinha do seu bebê.',
    cta: 'Ver presentes',
    href: phoootoUrl('/foto-presentes/'),
    badge: null,
  },
]

export default function AlbumImpressoPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function copyCoupon() {
    navigator.clipboard.writeText(COUPON).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F3F7', fontFamily: 'Inter, sans-serif', paddingBottom: 40 }}>
      <StatusBar />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 0' }}>
        <button
          onClick={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 12, border: '1.5px solid #E7E5F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Icon name="chevron-left" size={20} color="#6B53AE" />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, color: '#2E2C4A', margin: 0 }}>Álbum Impresso</h1>
          <p style={{ fontSize: 12, color: '#8B89B0', margin: 0 }}>em parceria com Phooto</p>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        margin: '16px 20px 0',
        borderRadius: 20,
        background: 'linear-gradient(135deg, #6B53AE 0%, #4E4490 60%, #3730A3 100%)',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 32 }}>📸</span>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 20, color: '#fff', margin: '8px 0 6px', lineHeight: 1.3 }}>
            Transforme memórias digitais em recordações físicas
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 18px', lineHeight: 1.5 }}>
            Fotolivros, revelações e presentes personalizados com as fotos do seu bebê.
          </p>

          {/* Coupon */}
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: '0 0 2px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Seu cupom exclusivo</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', margin: 0, letterSpacing: 2 }}>{COUPON}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0' }}>{DISCOUNT} de desconto em qualquer pedido</p>
            </div>
            <button
              onClick={copyCoupon}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: copied ? '#22C55E' : 'rgba(255,255,255,0.95)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                color: copied ? '#fff' : '#6B53AE',
                cursor: 'pointer',
                transition: 'all .2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              <Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? '#fff' : '#6B53AE'} />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Como funciona */}
      <div style={{ margin: '20px 20px 0', background: '#fff', borderRadius: 16, padding: '16px', border: '1.5px solid #E7E5F0' }}>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', margin: '0 0 12px' }}>Como funciona</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { step: '1', text: 'Escolha o produto abaixo e clique em criar' },
            { step: '2', text: 'Faça o upload das fotos do bebê no site da Phooto' },
            { step: '3', text: 'Aplique o cupom MEMORA15 no carrinho e ganhe 15% off' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg,#B79BD8,#6B53AE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 12, color: '#fff' }}>{step}</span>
              </div>
              <p style={{ fontSize: 13, color: '#4B4A6A', margin: 0, lineHeight: 1.4 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 15, color: '#2E2C4A', margin: 0 }}>Escolha o produto</h3>

        {SERVICES.map((s) => (
          <a
            key={s.title}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{ textDecoration: 'none' }}
          >
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
              {s.badge && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: '#FEE2E2', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#EF4444', letterSpacing: 0.5 }}>
                  {s.badge}
                </div>
              )}
              <div style={{ width: 48, height: 48, borderRadius: 14, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={s.icon} size={22} color={s.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#2E2C4A' }}>{s.title}</span>
                  <span style={{ fontSize: 11, color: '#8B89B0' }}>{s.subtitle}</span>
                </div>
                <p style={{ fontSize: 13, color: '#6B6A8A', margin: '4px 0 10px', lineHeight: 1.45 }}>{s.desc}</p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg,#B79BD8,#6B53AE)',
                  borderRadius: 10,
                  padding: '7px 14px',
                }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 12, color: '#fff' }}>{s.cta}</span>
                  <Icon name="external-link" size={12} color="rgba(255,255,255,0.8)" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Nota de parceria */}
      <div style={{ margin: '20px 20px 0', background: '#F0FDF4', borderRadius: 14, padding: '12px 14px', border: '1px solid #BBF7D0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, marginTop: 1 }}><Icon name="info" size={16} color="#16A34A" /></div>
        <p style={{ fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.5 }}>
          O cupom <strong>MEMORA15</strong> dá {DISCOUNT} de desconto em qualquer produto Phooto.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
