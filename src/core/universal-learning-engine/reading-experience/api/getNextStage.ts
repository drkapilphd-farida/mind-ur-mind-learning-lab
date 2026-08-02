import type { ReadingSession, ReadingSessionProgress } from '../types/ReadingSession'
import type { ReadingStage } from '../types/ReadingStage'

// Reading Experience APIs™. A caller supplies its own real, persisted
// `ReadingSessionProgress` (this sprint introduces no new storage —
// resumability is a type-level contract a future sprint's persistence
// layer fulfills) — real, honest `null` once every stage is done, never
// a fabricated stage.
export function getNextStage(session: ReadingSession, progress: ReadingSessionProgress): ReadingStage | null {
  return session.stages[progress.currentStageIndex] ?? null
}
