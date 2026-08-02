import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import type { ReadingSession } from '../types/ReadingSession'
import { generateReadingSession, type GenerateReadingSessionOptions } from '../generateReadingSession'

// Reading Experience APIs™. The public entry point — a thin, documented
// alias over Session Generator™'s own real implementation (no duplicate
// logic). Independent from UI: takes and returns plain data only.
export function getReadingSession(bundle: LearningAssetBundle, options?: GenerateReadingSessionOptions): ReadingSession {
  return generateReadingSession(bundle, options)
}
