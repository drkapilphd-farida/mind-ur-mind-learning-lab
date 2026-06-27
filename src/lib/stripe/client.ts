import Stripe from 'stripe'

function createClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.')
  }
  return new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' })
}

export const stripe = createClient()
