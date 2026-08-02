import { describe, expect, it, vi } from 'vitest'
import type { ReadingIntelligenceExperience } from '@/features/reading-intelligence'
import { makeExerciseSequenceItem, makeReadingIntelligenceExperienceResult } from '../testFixtures'
import { createReadingIntelligenceJourneyOrchestrator } from './DefaultReadingIntelligenceJourneyOrchestrator'

function makeStubExperience(
  result = makeReadingIntelligenceExperienceResult(),
): ReadingIntelligenceExperience {
  return { load: vi.fn().mockResolvedValue(result) }
}

describe('DefaultReadingIntelligenceJourneyOrchestrator', () => {
  it('Reading Intelligence Journey: composes a stub reading-intelligence result with the current stage sequence into a full journey', async () => {
    const sequence = [
      makeExerciseSequenceItem({ exerciseId: 'exercise-1', title: 'Exercise 1' }),
      makeExerciseSequenceItem({ exerciseId: 'exercise-2', title: 'Exercise 2' }),
    ]
    const orchestrator = createReadingIntelligenceJourneyOrchestrator({ experience: makeStubExperience() })

    const journey = await orchestrator.load(sequence)

    expect(journey.queue.items).toHaveLength(2)
    expect(journey.queue.items[0]).toEqual({
      exerciseId: 'exercise-1',
      title: 'Exercise 1',
      href: '/labs/quantum-speed-reading/exercise-1',
      status: 'completed',
    })
    expect(journey.queue.items[1]).toEqual({
      exerciseId: 'exercise-2',
      title: 'Exercise 2',
      href: '/labs/quantum-speed-reading/exercise-1',
      status: 'current',
    })
    expect(journey.mindScore).toBe(420)
    expect(journey.streak.currentStreak).toBe(3)
    expect(journey.xp.totalXp).toBe(85)
  })

  it('Exercise Queue: builds an empty queue for a terminal stage with no ModuleProgress entry (Reading Intelligence™)', async () => {
    const experienceResult = makeReadingIntelligenceExperienceResult({
      dailyMission: {
        stageId: 'reading-intelligence',
        stageTitle: 'Reading Intelligence™',
        actionLabel: 'Open',
        continueHref: '/labs/quantum-speed-reading/intelligence',
        isAllDone: false,
      },
    })
    const orchestrator = createReadingIntelligenceJourneyOrchestrator({
      experience: makeStubExperience(experienceResult),
    })

    const journey = await orchestrator.load([])

    expect(journey.queue).toEqual({ items: [], currentItem: null, remainingCount: 0 })
  })

  it('Determinism: two independently-constructed orchestrators produce identical results for identical stub data', async () => {
    const sequence = [makeExerciseSequenceItem()]
    const orchestratorA = createReadingIntelligenceJourneyOrchestrator({ experience: makeStubExperience() })
    const orchestratorB = createReadingIntelligenceJourneyOrchestrator({ experience: makeStubExperience() })

    const [journeyA, journeyB] = await Promise.all([orchestratorA.load(sequence), orchestratorB.load(sequence)])

    expect(journeyA).toEqual(journeyB)
  })
})
