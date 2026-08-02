import type { JourneyContext } from '../types'

// "Provide AI awareness of" the learner's current position in their
// journey — pure normalization; `completionPercent` is clamped to
// [0, 100].
export interface JourneyContextEngine {
  buildContext(input: Partial<JourneyContext>): JourneyContext
}
