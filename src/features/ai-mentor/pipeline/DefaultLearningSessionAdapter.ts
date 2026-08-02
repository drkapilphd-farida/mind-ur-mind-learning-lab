import type { LearningSessionAdapter, LearningSessionInput } from '../contracts'
import type { MentorActivitySnapshot } from '../types'

// Implements LearningSessionAdapter. `conceptsEncountered` reuses the
// plan's real concept titles; `studyModesUsed` reuses its real
// `availableStudyModes` — both genuinely derived from
// learning-intelligence's output, never invented.
export class DefaultLearningSessionAdapter implements LearningSessionAdapter {
  adapt(input: LearningSessionInput): MentorActivitySnapshot {
    return {
      learningProjectId: input.learningProjectId,
      conceptsEncountered: input.plan.concepts.map((concept) => concept.title),
      studyModesUsed: [...input.plan.availableStudyModes],
      sessionCount: input.sessionCount ?? 0,
    }
  }
}

export function createLearningSessionAdapter(): LearningSessionAdapter {
  return new DefaultLearningSessionAdapter()
}
