import type { SessionSnapshot } from '@/core/learning-session-runtime'
import { makeSessionSnapshot as makeSharedSessionSnapshot } from '@/features/learning-mode-runtime/testFixtures'

// Memory Mode™ Sprint-3 — Adaptive Memory Intelligence™ test fixtures.
// Chains the Shared Learning Runtime's own real `makeSessionSnapshot`
// (Sprint-1) for a real, valid base snapshot, then overrides only the
// fields a given test genuinely needs to vary (`metrics`,
// `completionPercentage`, `capturedAt`, …) — the same "reuse the real
// lower-layer builder, override only what the test is about" discipline
// every other layer's own testFixtures.ts already follows.
export async function makeMemorySnapshot(overrides: Partial<SessionSnapshot> = {}): Promise<SessionSnapshot> {
  const { snapshot } = await makeSharedSessionSnapshot('learner-1', 'memory')
  return { ...snapshot, ...overrides }
}
