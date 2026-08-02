import type { JourneyContext } from '../types'
import type { JourneyContextEngine } from '../contracts'

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

// Implements JourneyContextEngine. `completionPercent` is clamped to
// [0, 100] regardless of what a caller supplies — a caller's own bug
// (e.g. 130%) never propagates into the prompt as a nonsensical claim.
export class DefaultJourneyContextEngine implements JourneyContextEngine {
  buildContext(input: Partial<JourneyContext>): JourneyContext {
    return {
      currentJourney: input.currentJourney ?? null,
      currentChapter: input.currentChapter ?? null,
      currentLesson: input.currentLesson ?? null,
      currentExercise: input.currentExercise ?? null,
      completionPercent: clampPercent(input.completionPercent ?? 0),
      previousMilestones: input.previousMilestones ?? [],
    }
  }
}

export function createJourneyContextEngine(): JourneyContextEngine {
  return new DefaultJourneyContextEngine()
}
