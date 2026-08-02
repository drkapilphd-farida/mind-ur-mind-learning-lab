import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { makeSessionSnapshot as makeSharedSessionSnapshot } from '@/features/learning-mode-runtime/testFixtures'

// Smart Notes™ Sprint-4 — Analytics & Insights™ test fixtures. Chains
// the Shared Learning Runtime's own real `makeSessionSnapshot`
// (Sprint-1) for a real, valid base snapshot, then overrides only the
// fields a given test genuinely needs to vary — the same discipline
// Sprint-3's own `intelligence/testFixtures.ts` already follows.
export async function makeSmartNotesSnapshot(overrides: Partial<SessionSnapshot> = {}): Promise<SessionSnapshot> {
  const { snapshot } = await makeSharedSessionSnapshot('learner-1', 'smart-notes')
  return { ...snapshot, ...overrides }
}
