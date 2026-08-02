import { describe, expect, it } from 'vitest'
import { deriveJourneyStepStatuses } from './deriveJourneyStepStatuses'
import type { BlueprintJourneyStep } from '@/types/learning/blueprint'

const STEPS: readonly BlueprintJourneyStep[] = [
  { id: 'overview', title: 'Overview', description: 'd1', estimatedMinutes: 5 },
  { id: 'key-concepts', title: 'Key Concepts', description: 'd2', estimatedMinutes: 15 },
  { id: 'quiz', title: 'Quiz', description: 'd3', estimatedMinutes: 10 },
]

describe('deriveJourneyStepStatuses', () => {
  it('marks only the first step available, the rest locked', () => {
    const result = deriveJourneyStepStatuses(STEPS)
    expect(result.map((s) => s.status)).toEqual(['available', 'locked', 'locked'])
  })

  it('preserves every field from the original step', () => {
    const result = deriveJourneyStepStatuses(STEPS)
    expect(result[0]).toMatchObject({ id: 'overview', title: 'Overview', description: 'd1', estimatedMinutes: 5 })
  })

  it('returns an empty array for an empty step list', () => {
    expect(deriveJourneyStepStatuses([])).toEqual([])
  })
})
