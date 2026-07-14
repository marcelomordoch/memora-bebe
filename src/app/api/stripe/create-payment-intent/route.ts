import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

const PRODUCTS = {
  basico_yearly:   { amount: 850,   currency: 'brl', name: 'Memora Bebê Básico — Anual (5 GB)' },
  familia_yearly:  { amount: 2450,  currency: 'brl', name: 'Memora Bebê Família — Anual (15 GB)' },
  memorias_yearly: { amount: 4750,  currency: 'brl', name: 'Memora Bebê Memórias — Anual (30 GB)' },
  premium_yearly:  { amount: 9450,  currency: 'brl', name: 'Memora Bebê Premium — Anual (60 GB)' },
  pro_yearly:      { amount: 15700, currency: 'brl', name: 'Memora Bebê Pro — Anual (100 GB)' },
  giftcard_2990:   { amount: 2990,  currency: 'brl', name: 'Gift Card Memora Bebê R$ 29,90' },
  giftcard_4990:   { amount: 4990,  currency: 'brl', name: 'Gift Card Memora Bebê R$ 49,90' },
  giftcard_9990:   { amount: 9990,  currency: 'brl', name: 'Gift Card Memora Bebê R$ 99,90' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, plan, billing, amount, userId, recipientEmail, senderName, message } = body

    let intentAmount = 0
    let intentName = ''

    if (type === 'upgrade') {
      const productKey = `${plan}_yearly` as keyof typeof PRODUCTS
      const product = PRODUCTS[productKey]
      if (!product) return NextResponse.json({ error: 'Produto inválido' }, { status: 400 })
      intentAmount = product.amount
      intentName = product.name
    } else if (type === 'giftcard') {
      const cents = Math.round(parseFloat(amount) * 100)
      const productKey = `giftcard_${cents}` as keyof typeof PRODUCTS
      const product = PRODUCTS[productKey]
      if (!product) return NextResponse.json({ error: 'Produto inválido' }, { status: 400 })
      intentAmount = product.amount
      intentName = product.name
    } else if (type === 'credit') {
      const cents = Math.round(parseFloat(amount) * 100)
      if (cents < 100) return NextResponse.json({ error: 'Valor mínimo R$ 1,00' }, { status: 400 })
      intentAmount = cents
      intentName = `Créditos Memora Bebê — R$ ${parseFloat(amount).toFixed(2).replace('.', ',')}`
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const metadata: Record<string, string> = {
      type,
      plan: plan || '',
      billing: billing || '',
      userId: userId || '',
    }

    if (type === 'giftcard') {
      if (recipientEmail) metadata.recipientEmail = recipientEmail
      if (senderName) metadata.senderName = senderName
      if (message) metadata.message = message
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: intentAmount,
      currency: 'brl',
      description: intentName,
      automatic_payment_methods: { enabled: true },
      metadata,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: intentAmount,
      name: intentName,
    })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
