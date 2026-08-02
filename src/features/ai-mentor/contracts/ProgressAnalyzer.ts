import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implemented by a deterministic mock in Chunk 2. A future real
// analyzer (backed by genuine learning-session history) implements
// this exact same interface.
export interface ProgressAnalyzer {
  analyze(snapshot: MentorActivitySnapshot): Promise<MentorInsight>
}
