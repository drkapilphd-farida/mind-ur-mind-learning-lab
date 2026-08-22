import { describe, expect, it } from 'vitest'
import { CURRICULUM_EXERCISE_CATALOG } from './curriculumExerciseCatalog'
import {
  CHECKPOINT_DAYS,
  CURRICULUM_DAY_THEMES,
  CURRICULUM_PHASES,
  TOTAL_CURRICULUM_DAYS,
  buildCurriculumDayPlan,
  buildFullCurriculum,
  getCurriculumDayTheme,
  getCurriculumPhase,
  getPhaseForDay,
  getPhaseJustCompleted,
  isCheckpointDay,
} from './curriculumDatabase'

function allExerciseIdsInPlan(day: number): string[] {
  const plan = buildCurriculumDayPlan(day)
  return [
    ...plan.exercises.brainGym.map((exercise) => exercise.id),
    ...plan.exercises.rightBrainIntuition.map((exercise) => exercise.id),
    ...plan.exercises.visualization.map((exercise) => exercise.id),
    ...plan.exercises.readingIntelligence.map((exercise) => exercise.id),
  ]
}

describe('CURRICULUM_PHASES', () => {
  it('covers days 1-30 with no gaps or overlaps', () => {
    const coveredDays = new Set<number>()
    for (const phase of CURRICULUM_PHASES) {
      for (let day = phase.dayRange[0]; day <= phase.dayRange[1]; day++) {
        expect(coveredDays.has(day)).toBe(false)
        coveredDays.add(day)
      }
    }
    expect(coveredDays.size).toBe(TOTAL_CURRICULUM_DAYS)
  })
})

describe('getPhaseForDay / getCurriculumPhase', () => {
  it('maps boundary days to the correct phase', () => {
    expect(getPhaseForDay(1)).toBe(1)
    expect(getPhaseForDay(7)).toBe(1)
    expect(getPhaseForDay(8)).toBe(2)
    expect(getPhaseForDay(14)).toBe(2)
    expect(getPhaseForDay(15)).toBe(3)
    expect(getPhaseForDay(21)).toBe(3)
    expect(getPhaseForDay(22)).toBe(4)
    expect(getPhaseForDay(30)).toBe(4)
  })
  it('throws for out-of-range days', () => {
    expect(() => getPhaseForDay(0)).toThrow()
    expect(() => getPhaseForDay(31)).toThrow()
  })
  it('getCurriculumPhase returns the matching phase descriptor', () => {
    expect(getCurriculumPhase(3).title).toContain('Holographic Manifestation')
  })
})

describe('CURRICULUM_DAY_THEMES', () => {
  it('has exactly 30 entries, days 1-30 in order with no gaps', () => {
    expect(CURRICULUM_DAY_THEMES.map((theme) => theme.day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
  })
  it('every theme has a non-empty title and focus', () => {
    for (const theme of CURRICULUM_DAY_THEMES) {
      expect(theme.title.length).toBeGreaterThan(0)
      expect(theme.focus.length).toBeGreaterThan(0)
    }
  })
  it('getCurriculumDayTheme finds the right entry', () => {
    expect(getCurriculumDayTheme(1).title).toContain('Baseline')
    expect(getCurriculumDayTheme(30).title).toContain('Final Certification')
  })
})

describe('CHECKPOINT_DAYS / isCheckpointDay', () => {
  it('matches the documented checkpoint days', () => {
    expect(CHECKPOINT_DAYS).toEqual([1, 7, 14, 21, 30])
  })
  it('flags checkpoint and non-checkpoint days correctly', () => {
    expect(isCheckpointDay(1)).toBe(true)
    expect(isCheckpointDay(21)).toBe(true)
    expect(isCheckpointDay(2)).toBe(false)
  })
})

describe('getPhaseJustCompleted', () => {
  it('returns the phase whose last day this is, for Days 7/14/21', () => {
    expect(getPhaseJustCompleted(7)).toBe(1)
    expect(getPhaseJustCompleted(14)).toBe(2)
    expect(getPhaseJustCompleted(21)).toBe(3)
  })

  it('returns null for Day 30 — no Phase 5 to transition into', () => {
    expect(getPhaseJustCompleted(30)).toBeNull()
  })

  it('returns null for every non-phase-boundary day', () => {
    expect(getPhaseJustCompleted(1)).toBeNull()
    expect(getPhaseJustCompleted(6)).toBeNull()
    expect(getPhaseJustCompleted(15)).toBeNull()
  })
})

describe('buildCurriculumDayPlan', () => {
  it('throws for out-of-range days', () => {
    expect(() => buildCurriculumDayPlan(0)).toThrow()
    expect(() => buildCurriculumDayPlan(31)).toThrow()
    expect(() => buildCurriculumDayPlan(1.5)).toThrow()
  })

  it('only day 1 requires the mandatory baseline assessment', () => {
    expect(buildCurriculumDayPlan(1).requiresBaseline).toBe(true)
    for (let day = 2; day <= 30; day++) {
      expect(buildCurriculumDayPlan(day).requiresBaseline).toBe(false)
    }
  })

  it('every day plans at least one exercise from each of the 4 categories', () => {
    for (let day = 1; day <= TOTAL_CURRICULUM_DAYS; day++) {
      const plan = buildCurriculumDayPlan(day)
      expect(plan.exercises.brainGym.length).toBeGreaterThan(0)
      expect(plan.exercises.rightBrainIntuition.length).toBeGreaterThan(0)
      expect(plan.exercises.visualization.length).toBeGreaterThan(0)
      expect(plan.exercises.readingIntelligence.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic — building the same day twice yields the same plan', () => {
    expect(buildCurriculumDayPlan(15)).toEqual(buildCurriculumDayPlan(15))
  })

  it('Phase 3 (days 15-21) includes Sensory Hologram Builder and Fluid Energy Balancer in its visualization rotation', () => {
    const phase3VisualizationIds = new Set<string>()
    for (let day = 15; day <= 21; day++) {
      for (const exercise of buildCurriculumDayPlan(day).exercises.visualization) {
        phase3VisualizationIds.add(exercise.id)
      }
    }
    expect(phase3VisualizationIds.has('sensory-hologram-builder')).toBe(true)
    expect(phase3VisualizationIds.has('fluid-energy-balancer')).toBe(true)
  })

  it('covers every catalog exercise at least once across all 30 days (no exercise left unused)', () => {
    const touchedIds = new Set<string>()
    for (let day = 1; day <= TOTAL_CURRICULUM_DAYS; day++) {
      for (const id of allExerciseIdsInPlan(day)) {
        touchedIds.add(id)
      }
    }
    const catalogIds = new Set(CURRICULUM_EXERCISE_CATALOG.map((exercise) => exercise.id))
    for (const id of catalogIds) {
      expect(touchedIds.has(id)).toBe(true)
    }
    expect(touchedIds.size).toBe(catalogIds.size)
  })

  it('Eye Foundation Module exercises appear on days 22-27 in their exact real prerequisite order', () => {
    const expectedOrder = ['eye-warm-up', 'eye-stretch', 'eye-span', 'regression-control', 'reading-speed', 'rsvp']
    for (let i = 0; i < expectedOrder.length; i++) {
      const day = 22 + i
      expect(buildCurriculumDayPlan(day).exercises.brainGym.map((exercise) => exercise.id)).toContain(expectedOrder[i])
    }
  })

  it('Reading Expansion Module exercises appear on days 22-25 in their exact real prerequisite order', () => {
    const expectedOrder = ['phrase-reading', 'multi-line-reading', 'sentence-reading', 'paragraph-reading']
    for (let i = 0; i < expectedOrder.length; i++) {
      const day = 22 + i
      expect(buildCurriculumDayPlan(day).exercises.readingIntelligence.map((exercise) => exercise.id)).toContain(expectedOrder[i])
    }
  })

  it('Flash Intelligence Pack exercises appear on days 26-30 in their exact real prerequisite order', () => {
    const expectedOrder = ['word-flash', 'number-flash', 'symbol-flash', 'mixed-flash', 'peripheral-flash']
    for (let i = 0; i < expectedOrder.length; i++) {
      const day = 26 + i
      expect(buildCurriculumDayPlan(day).exercises.readingIntelligence.map((exercise) => exercise.id)).toContain(expectedOrder[i])
    }
  })

  it('progressive-chunk-reading appears on the final day', () => {
    expect(buildCurriculumDayPlan(30).exercises.readingIntelligence.map((exercise) => exercise.id)).toContain('progressive-chunk-reading')
  })
})

describe('buildFullCurriculum', () => {
  it('returns all 30 days in order', () => {
    const fullCurriculum = buildFullCurriculum()
    expect(fullCurriculum).toHaveLength(30)
    expect(fullCurriculum.map((plan) => plan.day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
  })
})
