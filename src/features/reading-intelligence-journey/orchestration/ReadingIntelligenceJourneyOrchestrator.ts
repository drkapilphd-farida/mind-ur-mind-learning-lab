import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'
import type { ReadingIntelligenceJourney } from '../types'

// The stable public entrypoint for this feature — orchestrates Sprint 46's
// reading-intelligence (unmodified) plus this feature's own Exercise Queue
// into one unified journey view. Does not wire into any page or route; that
// is deferred to a future sprint.
export interface ReadingIntelligenceJourneyOrchestrator {
  load(currentStageSequence: readonly ExerciseSequenceItem[]): Promise<ReadingIntelligenceJourney>
}
