import { describe, expect, it } from 'vitest'
import { getRecentThemes, recordThemeUsed } from './themeRotationHistory'

// Real localStorage I/O only ever runs client-side (`typeof window ===
// 'undefined'` guards every real branch) — same SSR-safety shape
// `recentContentHistory.ts`/`readingSpeedHandoff.ts` already established.
// Tests run in this project's real `node` environment (no `window`), so
// what's verifiable here is the honest no-op-not-throw SSR fallback.
describe('themeRotationHistory', () => {
  it('FIX-10/FIX-14 — is honest with no window (SSR): never throws, always falls back to empty', () => {
    expect(() => recordThemeUsed('nature')).not.toThrow()
    expect(getRecentThemes()).toEqual([])
  })
})
