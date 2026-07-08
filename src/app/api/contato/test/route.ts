import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    return NextResponse.json({ ok: false, error: 'RESEND_API_KEY não configurada no ambiente.' })
  }

  const resend = new Resend(key)
  const { data, error } = await resend.emails.send({
    from: 'Memora Bebê <onboarding@resend.dev>',
    to: 'marcelomord@gmail.com',
    subject: '[Teste] Formulário de contato funcionando',
    text: 'Este é um e-mail de teste do formulário de contato do Memora Bebê.',
  })

  if (error) {
    return NextResponse.json({ ok: false, error })
  }

  return NextResponse.json({ ok: true, id: data?.id })
}
