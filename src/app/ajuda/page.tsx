'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'
import AppShell from '@/components/layout/AppShell'

const FAQS: { category: string; icon: string; color: string; items: { q: string; a: string }[] }[] = [
  {
    category: 'Planos e armazenamento',
    icon: 'layers',
    color: '#EDE9FE',
    items: [
      {
        q: 'Qual a diferença entre os planos?',
        a: 'O plano gratuito oferece 1 GB de armazenamento para fotos e vídeos. Os planos pagos ampliam esse espaço (5 GB, 15 GB, 30 GB, 60 GB ou 100 GB). O álbum impresso (fotolivro) está disponível para todos os planos, inclusive o gratuito.',
      },
      {
        q: 'Posso fazer um fotolivro com o plano gratuito?',
        a: 'Sim! O álbum impresso via Phooto está disponível para todas as contas, independente do plano. Basta acessar Perfil → Álbum Impresso e seguir as instruções.',
      },
      {
        q: 'Como funciona a cobrança do plano?',
        a: 'Os planos são mensais, cobrados uma vez por mês no cartão de crédito. O acesso vale por 30 dias a partir da data da assinatura.',
      },
      {
        q: 'Posso fazer upgrade ou downgrade a qualquer momento?',
        a: 'Sim. Ao trocar de plano, o valor proporcional dos dias não usados do plano atual é creditado automaticamente no seu saldo e abatido na próxima assinatura.',
      },
      {
        q: 'O que acontece se eu atingir o limite de armazenamento?',
        a: 'Você não conseguirá fazer upload de novos arquivos. Suas memórias existentes ficam seguras. Para continuar, basta fazer upgrade para um plano maior.',
      },
    ],
  },
  {
    category: 'Créditos e gift cards',
    icon: 'gift',
    color: '#FEF3C7',
    items: [
      {
        q: 'O que são créditos?',
        a: 'Créditos são saldo em reais que ficam na sua conta e são abatidos automaticamente na próxima assinatura de plano. Você pode acumular créditos comprando diretamente ou resgatando gift cards.',
      },
      {
        q: 'Como compro créditos?',
        a: 'Acesse Perfil → Planos e toque em "Comprar créditos". Você pode adicionar R$ 10, R$ 30, R$ 50 ou R$ 100 de uma vez.',
      },
      {
        q: 'Como resgato um gift card?',
        a: 'Acesse Perfil → Gift Card → Resgatar gift card e digite o código no formato XXXX-XXXX-XXXX-XXXX. O valor é adicionado instantaneamente ao seu saldo.',
      },
      {
        q: 'Os créditos têm prazo de validade?',
        a: 'Não. Os créditos não expiram e ficam na sua conta até ser utilizados.',
      },
      {
        q: 'Como envio um gift card para alguém?',
        a: 'Acesse Perfil → Gift Card e escolha o valor. Após o pagamento, um código único é gerado. Você pode copiá-lo ou enviar via WhatsApp com uma mensagem personalizada.',
      },
    ],
  },
  {
    category: 'Memórias e mídias',
    icon: 'image',
    color: '#E2F1EA',
    items: [
      {
        q: 'Quais formatos de arquivo são suportados?',
        a: 'Fotos: JPG, PNG, HEIC, WebP. Vídeos: MP4, MOV, AVI (comprimidos automaticamente para economizar espaço). Áudios: MP3, M4A, WAV.',
      },
      {
        q: 'Minhas fotos e vídeos ficam privados?',
        a: 'Sim. Suas mídias são armazenadas de forma segura e criptografada. Só você tem acesso ao conteúdo da sua conta.',
      },
      {
        q: 'Posso excluir uma memória?',
        a: 'Sim, basta abrir a memória e usar a opção de exclusão. A ação é permanente e não pode ser desfeita.',
      },
    ],
  },
  {
    category: 'Conta e pagamento',
    icon: 'credit-card',
    color: '#DBEAFE',
    items: [
      {
        q: 'Como altero meu e-mail ou senha?',
        a: 'Para senha, acesse a tela de login e clique em "Esqueci minha senha". Para e-mail, entre em contato com o suporte.',
      },
      {
        q: 'Como cancelo minha assinatura?',
        a: 'Você pode deixar o plano expirar sem renovar — não há cobrança automática recorrente. Se quiser reembolso proporcional, entre em contato com o suporte.',
      },
      {
        q: 'Como excluo minha conta?',
        a: 'Acesse Perfil e toque em "Deletar conta". Atenção: todos os dados (memórias, fotos, vídeos) são apagados permanentemente e não podem ser recuperados.',
      },
    ],
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid var(--border-subtle, #E7E5F0)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          color: '#2E2C4A',
          lineHeight: 1.4,
          flex: 1,
        }}>
          {q}
        </span>
        <div style={{
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          <Icon name="chevron-down" size={18} color="#8B89B0" />
        </div>
      </button>
      {open && (
        <div style={{
          paddingBottom: 14,
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: '#6B6892',
          lineHeight: 1.6,
        }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function AjudaPage() {
  const router = useRouter()

  return (
    <AppShell>
      <div style={{ background: '#F4F3F7', minHeight: '100vh', paddingBottom: 40 }}>
        <div style={{ background: '#fff' }}>
          <StatusBar />
          <ScreenHeader title="Central de Ajuda" onBack={() => router.back()} />
        </div>

        {/* Intro */}
        <div style={{ padding: '20px 16px 8px' }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#8B89B0',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            Encontre respostas rápidas sobre o app. Não achou o que precisava?{' '}
            <button
              onClick={() => router.push('/ajuda/contato')}
              style={{ background: 'none', border: 'none', color: '#6B53AE', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}
            >
              Fale com a gente.
            </button>
          </p>
        </div>

        {/* FAQ sections */}
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map(section => (
            <div key={section.category} style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px 18px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: section.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon name={section.icon} size={17} color="#6B53AE" />
                </div>
                <span style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#2E2C4A',
                }}>
                  {section.category}
                </span>
              </div>
              {section.items.map(item => (
                <AccordionItem key={item.q} {...item} />
              ))}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div style={{ padding: '8px 16px 0' }}>
          <button
            onClick={() => router.push('/ajuda/contato')}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              border: '1.5px dashed #C4B8E8',
              background: '#F5F2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: 14,
              color: '#6B53AE',
            }}
          >
            <Icon name="message-circle" size={18} color="#6B53AE" />
            Não encontrei minha dúvida — falar com suporte
          </button>
        </div>
      </div>
    </AppShell>
  )
}
