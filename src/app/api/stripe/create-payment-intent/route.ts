import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

const PRODUCTS = {
  premium_monthly:  { amount: 2990,  currency: 'brl', name: 'Memora Bebê Premium — Mensal' },
  premium_yearly:   { amount: 24990, currency: 'brl', name: 'Memora Bebê Premium — Anual' },
  giftcard_2990:    { amount: 2990,  currency: 'brl', name: 'Gift Card Memora Bebê R$ 29,90' },
  giftcard_4990:    { amount: 4990,  currency: 'brl', name: 'Gift Card Memora Bebê R$ 49,90' },
  giftcard_9990:    { amount: 9990,  currency: 'brl', name: 'Gift Card Memora Bebê R$ 99,90' },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, plan, billing, amount } = body

    let productKey = ''
    if (type === 'upgrade') {
      productKey = billing === 'yearly' ? 'premium_yearly' : 'premium_monthly'
    } else if (type === 'giftcard') {
      const cents = Math.round(parseFloat(amount) * 100)
      productKey = `giftcard_${cents}` as keyof typeof PRODUCTS
    }

    const product = PRODUCTS[productKey as keyof typeof PRODUCTS]
    if (!product) {
      return NextResponse.json({ error: 'Produto inválido' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.amount,
      currency: product.currency,
      description: product.name,
      automatic_payment_methods: { enabled: true },
      metadata: { type, plan: plan || '', billing: billing || '', productKey },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: product.amount,
      name: product.name,
    })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
