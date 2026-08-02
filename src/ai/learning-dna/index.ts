// Future Learning DNA Engine — a per-learner model of how they learn
// best (pace, modality, retention patterns), read by Learning Blueprint™
// to personalize what's recommended next. No model/inference yet; this
// sprint only shapes the contract.

import { NotImplementedError } from '@/lib/errors'

export type LearningDNAProfile = {
  userId: string
  // Deliberately open-ended (jsonb-shaped in spirit) — the actual
  // dimensions this profile tracks are a product decision for whichever
  // sprint builds the engine, not this foundation.
  traits: Record<string, unknown>
  updatedAt: string
}

export async function getLearningDNAProfile(userId: string): Promise<LearningDNAProfile> {
  throw new NotImplementedError(`getLearningDNAProfile(${userId}) — Learning DNA Engine sprint`)
}
