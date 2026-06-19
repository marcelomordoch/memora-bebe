'use client'

import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'

export default function PrivacidadePage() {
  const router = useRouter()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />
      <ScreenHeader title="Política de Privacidade" onBack={() => router.back()} />
      <div style={{ flex: 1, padding: '8px 20px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)' }}>Política de Privacidade</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Última atualização: junho de 2026</p>
        {[
          ['Dados coletados', 'Coletamos nome, e-mail, dados do bebê que você insere voluntariamente, e informações de uso do app para melhorar nossos serviços.'],
          ['Uso dos dados', 'Usamos seus dados para fornecer e melhorar o serviço, enviar notificações relevantes e processar pagamentos.'],
          ['Compartilhamento', 'Não vendemos seus dados. Compartilhamos apenas com prestadores de serviço essenciais (Supabase, Mercado Pago) sob acordos de confidencialidade.'],
          ['Armazenamento', 'Seus dados são armazenados de forma segura na infraestrutura da Supabase, com backups automáticos.'],
          ['Seus direitos', 'Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento via suporte@memorabebe.com.br.'],
          ['Cookies', 'Usamos cookies essenciais para manter sua sessão. Não usamos cookies de rastreamento de terceiros.'],
          ['Menores', 'Não coletamos dados diretamente de crianças. Os dados do bebê são inseridos pelos responsáveis adultos.'],
          ['Contato', 'suporte@memorabebe.com.br — respondemos em até 48h úteis.'],
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
