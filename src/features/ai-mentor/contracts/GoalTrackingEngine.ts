import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implemented by a deterministic mock in Chunk 2.
export interface GoalTrackingEngine {
  track(snapshot: MentorActivitySnapshot): Promise<MentorInsight>
}
