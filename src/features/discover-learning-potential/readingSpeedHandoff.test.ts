import { describe, expect, it } from 'vitest'
import { getLastReadingSpeed, recordLastReadingSpeed } from './readingSpeedHandoff'

// This module's real localStorage I/O only ever runs client-side
// (`typeof window === 'undefined'` guards every real branch) — the same
// SSR-safety shape `recentContentHistory.ts` already established. Tests
// run in this project's real `node` environment (no `window`), so what's
// actually verifiable here is the honest, no-op-not-throw SSR fallback —
// real localStorage round-tripping is exercised by the real browser at
// runtime, not by this unit test.
describe('readingSpeedHandoff', () => {
  it('FIX-03 — is honest with no window (SSR): never throws, always falls back to null', () => {
    expect(() => recordLastReadingSpeed(200)).not.toThrow()
    expect(getLastReadingSpeed()).toBeNull()
  })
})
