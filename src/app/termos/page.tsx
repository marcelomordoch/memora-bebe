'use client'

import { useRouter } from 'next/navigation'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'

const SECTIONS = [
  {
    title: '1. Aceitação dos Termos',
    body: 'Ao criar uma conta no Memora Bebê ("Plataforma"), o Usuário declara ter lido, compreendido e concordado integralmente com estes Termos de Uso ("Termos"). Caso não concorde com qualquer disposição aqui prevista, o Usuário não deverá utilizar a Plataforma. O uso continuado após eventuais atualizações dos Termos implica aceitação das novas condições.',
  },
  {
    title: '2. Descrição do Serviço',
    body: 'O Memora Bebê é uma plataforma digital destinada ao registro, armazenamento e organização de memórias relacionadas ao desenvolvimento de bebês e crianças, incluindo fotos, vídeos, áudios e textos ("Conteúdo"). A Plataforma é fornecida no estado em que se encontra ("as is"), podendo sofrer atualizações, interrupções programadas ou descontinuação sem aviso prévio.',
  },
  {
    title: '3. Elegibilidade e Cadastro',
    body: 'O uso da Plataforma é permitido a maiores de 18 anos ou a menores devidamente representados por seus responsáveis legais. O Usuário é responsável pela veracidade das informações fornecidas no cadastro e pela confidencialidade de sua senha de acesso. Qualquer atividade realizada com as credenciais do Usuário é de sua exclusiva responsabilidade.',
  },
  {
    title: '4. Conteúdo do Usuário e Uso Adequado',
    body: 'O Usuário é o único e exclusivo responsável por todo o Conteúdo que inserir na Plataforma. É expressamente proibido: (a) publicar conteúdo ilegal, ofensivo, difamatório, pornográfico ou que viole direitos de terceiros; (b) utilizar a Plataforma para fins comerciais não autorizados; (c) tentar acessar contas de outros usuários; (d) realizar engenharia reversa, decompilação ou qualquer manipulação não autorizada do sistema. O Memora Bebê reserva-se o direito de remover Conteúdo e suspender contas que violem estas regras, sem aviso prévio e sem direito a reembolso.',
  },
  {
    title: '5. Isenção de Responsabilidade por Uso Indevido',
    body: 'O Memora Bebê não se responsabiliza, em nenhuma hipótese, por qualquer uso indevido da Plataforma pelo próprio Usuário ou por terceiros que acessem a conta do Usuário com ou sem o seu consentimento. O Usuário reconhece que é o único responsável pelo uso que faz da Plataforma e pelo Conteúdo que nela armazena, isentando o Memora Bebê de qualquer reclamação, ação judicial ou demanda decorrente de tal uso.',
  },
  {
    title: '6. Segurança e Isenção de Responsabilidade por Incidentes Cibernéticos',
    body: 'O Memora Bebê adota medidas técnicas de segurança compatíveis com padrões razoáveis do setor, incluindo armazenamento criptografado, transmissão via HTTPS e controle de acesso por autenticação. Contudo, nenhum sistema de segurança é absolutamente inviolável. O Memora Bebê não garante proteção absoluta contra acessos não autorizados, ataques de hackers, vírus, vazamentos de dados ou qualquer outro incidente cibernético. Ao aceitar estes Termos, o Usuário reconhece e concorda que o Memora Bebê não poderá ser responsabilizado por danos, perdas ou prejuízos decorrentes de ataques cibernéticos, invasões, falhas de terceiros provedores de infraestrutura (como serviços de nuvem, processadores de pagamento ou provedores de autenticação) ou quaisquer outros eventos fora do controle razoável da Plataforma.',
  },
  {
    title: '7. Disponibilidade e Integridade dos Dados',
    body: 'O Memora Bebê envidará esforços razoáveis para manter a Plataforma disponível e os dados preservados. No entanto, não garante disponibilidade ininterrupta, nem a preservação permanente dos dados em caso de falhas técnicas graves, desastres ou circunstâncias de força maior. O Usuário é fortemente recomendado a realizar backups independentes de seu Conteúdo. O Memora Bebê não se responsabiliza por perda total ou parcial de dados.',
  },
  {
    title: '8. Planos, Pagamentos e Cancelamento',
    body: 'A Plataforma oferece planos gratuitos e pagos. Os pagamentos são processados por terceiros (Stripe), e o Memora Bebê não armazena dados de cartão de crédito. Os planos pagos são cobrados mensalmente, sem renovação automática obrigatória. O cancelamento pode ser feito a qualquer momento pelo próprio Usuário. Não há reembolso proporcional por período não utilizado, exceto quando previsto em lei ou mediante análise do suporte.',
  },
  {
    title: '9. Privacidade e Proteção de Dados',
    body: 'O tratamento de dados pessoais é regido pela Política de Privacidade da Plataforma, disponível em /privacidade, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). O Memora Bebê não comercializa dados pessoais dos Usuários.',
  },
  {
    title: '10. Propriedade Intelectual',
    body: 'O Usuário mantém todos os direitos sobre o Conteúdo que inserir na Plataforma. Ao fazê-lo, concede ao Memora Bebê uma licença limitada, não exclusiva e revogável para armazenar e exibir o Conteúdo exclusivamente ao próprio Usuário e a quem este autorizar. O design, código, marca e demais elementos da Plataforma são de propriedade exclusiva do Memora Bebê.',
  },
  {
    title: '11. Limitação Geral de Responsabilidade',
    body: 'Na máxima extensão permitida pela legislação aplicável, o Memora Bebê não será responsável por danos indiretos, incidentais, especiais, punitivos ou consequentes, incluindo lucros cessantes, perda de dados ou danos à reputação, ainda que tenha sido alertado da possibilidade de tais danos. A responsabilidade total do Memora Bebê perante o Usuário, por qualquer causa, fica limitada ao valor pago pelo Usuário nos últimos 3 (três) meses anteriores ao evento que originou a reclamação.',
  },
  {
    title: '12. Alterações nos Termos',
    body: 'O Memora Bebê pode alterar estes Termos a qualquer momento. Alterações relevantes serão comunicadas ao Usuário por e-mail ou notificação dentro da Plataforma. O uso continuado após a notificação implica aceitação das novas condições.',
  },
  {
    title: '13. Lei Aplicável e Foro',
    body: 'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de domicílio do Usuário para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
  },
  {
    title: '14. Contato',
    body: 'Para dúvidas, solicitações ou reclamações relacionadas a estes Termos, o Usuário pode entrar em contato pelo e-mail: marcelomord@gmail.com ou pelo formulário em /ajuda/contato.',
  },
]

export default function TermosPage() {
  const router = useRouter()
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />
      <ScreenHeader title="Termos de Uso" onBack={() => router.back()} />
      <div style={{ flex: 1, padding: '8px 20px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-strong)', marginBottom: 4 }}>
            Termos de Uso — Memora Bebê
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Última atualização: julho de 2026
          </p>
        </div>
        {SECTIONS.map(({ title, body }) => (
          <div key={title}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-strong)', marginBottom: 6 }}>
              {title}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-body)', fontFamily: 'var(--font-body)', lineHeight: 1.75, margin: 0 }}>
              {body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
