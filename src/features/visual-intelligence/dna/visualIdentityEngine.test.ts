import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from './dnaContext'
import { computeVisualIdentity } from './visualIdentityEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeVisualIdentity', () => {
  it('resolves sensible neutral defaults with no history at all', () => {
    const identity = computeVisualIdentity(buildDnaContext(EMPTY))
    expect(identity.observationStyle).toBe('Calm Observer')
    expect(identity.focusStyle).toBe('Momentum Builder')
    expect(identity.visualProcessingStyle).toBe('Balanced Processor')
    expect(identity.peripheralStyle).toBe('Expanding Vision')
  })

  it('identifies Visual Detective for heavy journal usage across many persistence challenges', () => {
    const persistenceChallenge = Array.from({ length: 6 }, (_, i) => ({
      imageId: 'nature',
      reflectionResponse: 'dim-image' as const,
      journalNotes: 'a real observation',
      durationSeconds: 75,
      completed: true,
      occurredAt: `2026-07-0${(i % 5) + 1}T10:00:00.000Z`,
    }))
    const identity = computeVisualIdentity(buildDnaContext({ ...EMPTY, persistenceChallenge }))
    expect(identity.observationStyle).toBe('Visual Detective')
  })

  it('identifies Wide Awareness for accurate peripheral practice', () => {
    const fixation = [
      { exerciseType: 'peripheral' as const, level: 'standard', durationSeconds: 45, accuracyPercent: 80, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
    ]
    const identity = computeVisualIdentity(buildDnaContext({ ...EMPTY, fixation }))
    expect(identity.peripheralStyle).toBe('Wide Awareness')
  })

  it('identifies Tunnel Focus for attempted-but-inaccurate peripheral practice', () => {
    const fixation = [
      { exerciseType: 'peripheral' as const, level: 'standard', durationSeconds: 45, accuracyPercent: 20, completed: true, occurredAt: '2026-07-05T10:00:00.000Z' },
    ]
    const identity = computeVisualIdentity(buildDnaContext({ ...EMPTY, fixation }))
    expect(identity.peripheralStyle).toBe('Tunnel Focus')
  })
})
