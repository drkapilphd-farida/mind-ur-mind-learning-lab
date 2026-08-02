import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { makeSessionSnapshot as makeSharedSessionSnapshot } from '@/features/learning-mode-runtime/testFixtures'

// Smart Notes™ Sprint-3 — Adaptive Intelligence™ test fixtures. Chains
// the Shared Learning Runtime's own real `makeSessionSnapshot`
// (Sprint-1) for a real, valid base snapshot, then overrides only the
// fields a given test genuinely needs to vary — the same discipline
// Memory Mode™'s own `intelligence/testFixtures.ts` (Sprint-3) already
// follows.
export async function makeSmartNotesSnapshot(overrides: Partial<SessionSnapshot> = {}): Promise<SessionSnapshot> {
  const { snapshot } = await makeSharedSessionSnapshot('learner-1', 'smart-notes')
  return { ...snapshot, ...overrides }
}
