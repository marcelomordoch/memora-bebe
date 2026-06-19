import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { type, productKey } = pi.metadata

    console.log(`✅ Pagamento aprovado: ${productKey} | R$ ${pi.amount / 100}`)

    // Aqui: atualizar o banco Supabase conforme o tipo
    // type === 'upgrade' → atualizar profiles.plan = 'premium'
    // type === 'giftcard' → criar gift_card no banco
  }

  return NextResponse.json({ received: true })
}
