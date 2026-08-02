import { describe, it, expect } from 'vitest'
import { deriveAvailability, type ExerciseStatus } from './getModuleProgress'

const SEQUENCE = ['phrase-reading', 'multi-line-reading', 'sentence-reading', 'paragraph-reading'] as const

describe('deriveAvailability', () => {
  it('is monotonic: an out-of-order completed row cannot unlock past an incomplete earlier exercise', () => {
    // The exact real-world state this fix addresses: sentence-reading has
    // its own completed row, but phrase-reading and multi-line-reading
    // (both earlier in sequence) have no row at all.
    const status: Record<string, ExerciseStatus> = {
      'phrase-reading': 'not-started',
      'multi-line-reading': 'not-started',
      'sentence-reading': 'completed',
      'paragraph-reading': 'not-started',
    }

    expect(deriveAvailability([...SEQUENCE], status)).toEqual({
      'phrase-reading': 'current',
      'multi-line-reading': 'locked',
      'sentence-reading': 'locked',
      'paragraph-reading': 'locked',
    })
  })

  it('unlocks each exercise once every exercise before it is completed, in order', () => {
    const status: Record<string, ExerciseStatus> = {
      'phrase-reading': 'completed',
      'multi-line-reading': 'completed',
      'sentence-reading': 'not-started',
      'paragraph-reading': 'not-started',
    }

    expect(deriveAvailability([...SEQUENCE], status)).toEqual({
      'phrase-reading': 'completed',
      'multi-line-reading': 'completed',
      'sentence-reading': 'current',
      'paragraph-reading': 'locked',
    })
  })

  it('marks every exercise completed once the whole sequence is done', () => {
    const status: Record<string, ExerciseStatus> = {
      'phrase-reading': 'completed',
      'multi-line-reading': 'completed',
      'sentence-reading': 'completed',
      'paragraph-reading': 'completed',
    }

    expect(deriveAvailability([...SEQUENCE], status)).toEqual({
      'phrase-reading': 'completed',
      'multi-line-reading': 'completed',
      'sentence-reading': 'completed',
      'paragraph-reading': 'completed',
    })
  })

  it('marks the first exercise current and the rest locked when nothing is started', () => {
    const status: Record<string, ExerciseStatus> = {
      'phrase-reading': 'not-started',
      'multi-line-reading': 'not-started',
      'sentence-reading': 'not-started',
      'paragraph-reading': 'not-started',
    }

    expect(deriveAvailability([...SEQUENCE], status)).toEqual({
      'phrase-reading': 'current',
      'multi-line-reading': 'locked',
      'sentence-reading': 'locked',
      'paragraph-reading': 'locked',
    })
  })

  it('treats an in-progress (not completed) exercise as the current one, not completed', () => {
    const status: Record<string, ExerciseStatus> = {
      'phrase-reading': 'completed',
      'multi-line-reading': 'in-progress',
      'sentence-reading': 'not-started',
      'paragraph-reading': 'not-started',
    }

    expect(deriveAvailability([...SEQUENCE], status)).toEqual({
      'phrase-reading': 'completed',
      'multi-line-reading': 'current',
      'sentence-reading': 'locked',
      'paragraph-reading': 'locked',
    })
  })

  it('two separate out-of-order completions still only unlock up to the first gap', () => {
    // phrase-reading incomplete, but BOTH multi-line-reading and
    // paragraph-reading have stray completed rows.
    const status: Record<string, ExerciseStatus> = {
      'phrase-reading': 'not-started',
      'multi-line-reading': 'completed',
      'sentence-reading': 'not-started',
      'paragraph-reading': 'completed',
    }

    expect(deriveAvailability([...SEQUENCE], status)).toEqual({
      'phrase-reading': 'current',
      'multi-line-reading': 'locked',
      'sentence-reading': 'locked',
      'paragraph-reading': 'locked',
    })
  })
})
