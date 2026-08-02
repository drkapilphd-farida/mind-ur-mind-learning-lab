import { describe, expect, it } from 'vitest'
import { buildDnaContext, type DnaRawSources } from './dnaContext'
import { computeEvolutionNotes } from './evolutionNotesEngine'

const EMPTY: DnaRawSources = { imagePersistence: [], visualPreparation: [], fixation: [], persistenceChallenge: [] }

describe('computeEvolutionNotes', () => {
  it('returns no notes with no history', () => {
    expect(computeEvolutionNotes(buildDnaContext(EMPTY))).toHaveLength(0)
  })

  it('emits no delta line for the first week with data (nothing to compare against)', () => {
    const notes = computeEvolutionNotes(
      buildDnaContext({
        ...EMPTY,
        persistenceChallenge: [
          { imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: 'note', durationSeconds: 75, completed: true, occurredAt: '2026-06-01T10:00:00.000Z' },
        ],
      }),
    )
    // Only week with data -> "improving steadily" fallback line, no % delta possible.
    expect(notes).toHaveLength(1)
    expect(notes[0]!.lines[0]).toContain('improving steadily')
  })

  it('emits a real observation-rate delta between two distinct weeks with data', () => {
    const notes = computeEvolutionNotes(
      buildDnaContext({
        ...EMPTY,
        persistenceChallenge: [
          // Week 1: 1 of 2 sessions used the journal -> rate 0.5 (a real, non-zero baseline).
          { imageId: 'nature', reflectionResponse: 'dim-image', journalNotes: null, durationSeconds: 75, completed: true, occurredAt: '2026-06-01T10:00:00.000Z' },
          { imageId: 'object', reflectionResponse: 'colours-changed', journalNotes: 'noted', durationSeconds: 75, completed: true, occurredAt: '2026-06-02T10:00:00.000Z' },
          // Week 2 (a different ISO week): both sessions used the journal -> rate 1.0, a real improvement over 0.5.
          { imageId: 'animal', reflectionResponse: 'bright-image', journalNotes: 'a real note', durationSeconds: 75, completed: true, occurredAt: '2026-06-15T10:00:00.000Z' },
          { imageId: 'human-face', reflectionResponse: 'nothing-noticeable', journalNotes: 'another note', durationSeconds: 75, completed: true, occurredAt: '2026-06-16T10:00:00.000Z' },
        ],
      }),
    )
    const allLines = notes.flatMap((n) => n.lines)
    expect(allLines.some((line) => line.includes('Observation improved'))).toBe(true)
  })
})
