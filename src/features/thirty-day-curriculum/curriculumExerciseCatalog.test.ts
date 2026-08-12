import { describe, expect, it } from 'vitest'
import {
  CURRICULUM_EXERCISE_CATALOG,
  CURRICULUM_EXERCISE_CATEGORIES,
  EYE_FOUNDATION_POOL,
  FLASH_INTELLIGENCE_POOL,
  READING_EXPANSION_POOL,
  getCurriculumExerciseById,
} from './curriculumExerciseCatalog'

describe('CURRICULUM_EXERCISE_CATALOG', () => {
  it('has no duplicate ids', () => {
    const ids = CURRICULUM_EXERCISE_CATALOG.map((exercise) => exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every exercise has a valid category', () => {
    for (const exercise of CURRICULUM_EXERCISE_CATALOG) {
      expect(CURRICULUM_EXERCISE_CATEGORIES).toContain(exercise.category)
    }
  })

  it('every exercise has a non-empty title and a real /labs/quantum-speed-reading href', () => {
    for (const exercise of CURRICULUM_EXERCISE_CATALOG) {
      expect(exercise.title.length).toBeGreaterThan(0)
      expect(exercise.href.startsWith('/labs/quantum-speed-reading/')).toBe(true)
    }
  })

  it('does not include schulte-grid-drill (no standalone route exists for it)', () => {
    expect(getCurriculumExerciseById('schulte-grid-drill')).toBeUndefined()
  })

  it('includes schulte-grid-speed-drill as its routable replacement', () => {
    expect(getCurriculumExerciseById('schulte-grid-speed-drill')).toBeDefined()
  })
})

describe('getCurriculumExerciseById', () => {
  it('finds a known exercise', () => {
    expect(getCurriculumExerciseById('rsvp')?.title).toBe('RSVP')
  })
  it('returns undefined for an unknown id', () => {
    expect(getCurriculumExerciseById('does-not-exist')).toBeUndefined()
  })
})

describe('gated module pools preserve their real, server-enforced internal order', () => {
  it('Eye Foundation Module order matches eyeFoundationModule.ts', () => {
    expect(EYE_FOUNDATION_POOL.map((exercise) => exercise.id)).toEqual([
      'eye-warm-up',
      'eye-stretch',
      'eye-span',
      'regression-control',
      'reading-speed',
      'rsvp',
    ])
  })

  it('Reading Expansion Module order matches readingExpansionModule.ts', () => {
    expect(READING_EXPANSION_POOL.map((exercise) => exercise.id)).toEqual([
      'phrase-reading',
      'multi-line-reading',
      'sentence-reading',
      'paragraph-reading',
    ])
  })

  it('Flash Intelligence Pack order matches flashIntelligenceModule.ts', () => {
    expect(FLASH_INTELLIGENCE_POOL.map((exercise) => exercise.id)).toEqual([
      'word-flash',
      'number-flash',
      'symbol-flash',
      'mixed-flash',
      'peripheral-flash',
    ])
  })
})
