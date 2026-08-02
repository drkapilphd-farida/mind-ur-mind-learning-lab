import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implemented by a deterministic mock in Chunk 2.
export interface MotivationEngine {
  assess(snapshot: MentorActivitySnapshot): Promise<MentorInsight>
}
