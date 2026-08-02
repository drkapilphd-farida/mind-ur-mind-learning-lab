import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implemented by a deterministic mock in Chunk 2. Returns a collection
// (zero or more) rather than one insight — unlike ProgressAnalyzer/
// LearningPatternAnalyzer, a learner may have any number of detected
// weak areas, including none.
export interface WeaknessDetector {
  detect(snapshot: MentorActivitySnapshot): Promise<readonly MentorInsight[]>
}
