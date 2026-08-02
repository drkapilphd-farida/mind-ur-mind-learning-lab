import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implemented by a deterministic mock in Chunk 2. Mirrors
// WeaknessDetector's shape (a collection, not a single insight).
export interface StrengthDetector {
  detect(snapshot: MentorActivitySnapshot): Promise<readonly MentorInsight[]>
}
