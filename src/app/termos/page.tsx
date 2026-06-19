'use client'

import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'

export default function TermosPage() {
  const router = useRouter()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />
      <ScreenHeader title="Termos de Uso" onBack={() => router.back()} />
      <div style={{ flex: 1, padding: '8px 20px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)' }}>Termos de Uso — Memora Bebê</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Última atualização: junho de 2026</p>
        {[
          ['1. Aceitação dos Termos', 'Ao criar uma conta no Memora Bebê, você concorda com estes Termos de Uso. Se não concordar, não utilize nossos serviços.'],
          ['2. Plano Gratuito e Premium', 'O plano gratuito permite visualizar memórias, curtir e comentar. O plano Premium desbloqueia upload de fotos, vídeos e áudios, além de armazenamento ilimitado.'],
          ['3. Conteúdo do Usuário', 'Você é responsável pelo conteúdo que publica. É proibido publicar conteúdo ilegal, ofensivo ou que viole direitos de terceiros.'],
          ['4. Privacidade e Dados', 'Seus dados são tratados conforme nossa Política de Privacidade. Não vendemos seus dados a terceiros.'],
          ['5. Pagamentos', 'Os pagamentos são processados de forma segura via Mercado Pago. Planos Premium têm cobrança recorrente mensal ou anual.'],
          ['6. Rescisão', 'Você pode cancelar sua conta a qualquer momento. Os dados podem ser mantidos por até 30 dias após o cancelamento.'],
          ['7. Limitação de Responsabilidade', 'O Memora Bebê não se responsabiliza por perda de dados ou danos indiretos. Faça backups regulares.'],
          ['8. Contato', 'Em caso de dúvidas: suporte@memorabebe.com.br'],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--text-strong)', marginBottom: 6 }}>{title}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-body)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
