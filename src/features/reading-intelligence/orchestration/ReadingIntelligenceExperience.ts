import type { ReadingIntelligenceExperienceResult } from '../types'

// The stable public entrypoint for this feature. Composes real, live,
// Supabase-backed production functions — see DefaultReadingIntelligenceExperience
// for the one confined seam where those real calls happen. Does not wire into
// any page or route; that is deferred to a future sprint.
export interface ReadingIntelligenceExperience {
  load(): Promise<ReadingIntelligenceExperienceResult>
}
