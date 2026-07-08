import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const SUPPORT_EMAIL = 'marcelomord@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, userId } = await req.json() as {
      name: string
      email: string
      subject: string
      message: string
      userId?: string
    }

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      console.error('[contato] RESEND_API_KEY não configurada')
      return NextResponse.json({ error: 'Serviço de e-mail não configurado.' }, { status: 500 })
    }

    const resend = new Resend(resendKey)

    const body = `
Nome: ${name}
E-mail: ${email}
Assunto: ${subject}
User ID: ${userId ?? '(não autenticado)'}

--- Mensagem ---
${message}
    `.trim()

    const { error } = await resend.emails.send({
      from: 'Memora Bebê Suporte <noreply@memorabebe.com.br>',
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[Suporte] ${subject} — ${name}`,
      text: body,
    })

    if (error) {
      console.error('[contato] Resend error:', error)
      return NextResponse.json({ error: 'Erro ao enviar e-mail.' }, { status: 500 })
    }

    console.log(`✅ Contato enviado: ${email} → ${subject}`)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[contato]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
