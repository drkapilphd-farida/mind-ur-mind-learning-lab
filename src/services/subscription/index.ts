// Business logic for the `subscription` domain (Plans, Subscriptions,
// Entitlements). Every function throws until a future sprint implements
// it against
// supabase/migrations/20260711000005_create_plans_subscriptions_entitlements.sql
// — see docs/adr/0002-domain-layered-architecture.md. `api/subscription/`
// is the only intended caller. Billing state itself is written
// server-side by a Stripe webhook (service-role client), never through
// these functions directly — see the migration's own RLS comments.

import { NotImplementedError } from '@/lib/errors'
import type { Entitlement, Plan, Subscription } from '@/types/subscription'

export async function listActivePlans(): Promise<readonly Plan[]> {
  throw new NotImplementedError('listActivePlans — Subscription/Billing sprint')
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  throw new NotImplementedError(`getActiveSubscription(${userId}) — Subscription/Billing sprint`)
}

export async function getEntitlement(userId: string, key: string): Promise<Entitlement | null> {
  throw new NotImplementedError(`getEntitlement(${userId}, ${key}) — Entitlements sprint`)
}
