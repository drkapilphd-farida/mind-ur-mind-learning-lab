import type { ReadingSession } from '../types/ReadingSession'
import type { DifficultyLevel } from '../types/DifficultyLevel'

// Reading Experience APIs™. The session's own real, already-computed
// overall level (Difficulty Progression Engine™) — never recomputed
// here, so this always matches what Session Generator™ actually stored.
export function getDifficultyLevel(session: ReadingSession): DifficultyLevel {
  return session.difficultyLevel
}
