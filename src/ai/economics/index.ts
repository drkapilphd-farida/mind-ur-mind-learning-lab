// Future AI Economics Engine — cost/usage aggregation over `ai_events`
// (supabase/migrations/20260711000004_create_ai_events.sql). Sprint 0
// ships the contract only; no query against the table yet.

import { NotImplementedError } from '@/lib/errors'

export type UsageSummary = {
  userId: string
  totalEvents: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCostCents: number
  periodStart: string
  periodEnd: string
}

export async function getUsageSummary(userId: string, periodStart: string, periodEnd: string): Promise<UsageSummary> {
  throw new NotImplementedError(`getUsageSummary(${userId}, ${periodStart}, ${periodEnd}) — AI Economics Engine sprint`)
}
