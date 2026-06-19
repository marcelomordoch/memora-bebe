import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

// Admin client — uses service role key, bypasses RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Generates a code like XXXX-XXXX-XXXX-XXXX (alphanumeric, uppercase)
function generateGiftCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${segment()}-${segment()}-${segment()}-${segment()}`
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { type, productKey, userId, billing, recipientEmail, senderName, message } = pi.metadata

    console.log(`✅ Pagamento aprovado: ${productKey} | R$ ${pi.amount / 100} | userId: ${userId}`)

    const supabase = getAdminClient()

    if (type === 'upgrade') {
      if (!userId) {
        console.error('upgrade sem userId no metadata')
        return NextResponse.json({ received: true })
      }

      const days = billing === 'yearly' ? 365 : 30
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + days)

      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'premium',
          plan_expires_at: expiresAt.toISOString(),
        })
        .eq('id', userId)

      if (error) {
        console.error('Erro ao atualizar plano:', error)
        return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
      }

      console.log(`✅ Usuário ${userId} atualizado para premium até ${expiresAt.toISOString()}`)
    }

    if (type === 'giftcard') {
      const code = generateGiftCode()
      const amountReais = pi.amount / 100

      const { error } = await supabase.from('gift_cards').insert({
        code,
        amount: amountReais,
        sender_id: userId || null,
        sender_name: senderName || 'Anônimo',
        recipient_email: recipientEmail || null,
        message: message || '',
        redeemed: false,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Erro ao criar gift card:', error)
        return NextResponse.json({ error: 'Erro ao criar gift card' }, { status: 500 })
      }

      console.log(`✅ Gift card criado: ${code} — R$ ${amountReais}`)
    }
  }

  return NextResponse.json({ received: true })
}
