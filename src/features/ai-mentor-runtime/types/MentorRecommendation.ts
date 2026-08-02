// AI Mentor™ Sprint-3. A real, deterministic recommendation — never
// AI-generated, never a judgment of content quality. `priority` is a
// disclosed, simple triage signal for display ordering, not a score.
export type MentorRecommendationPriority = 'low' | 'medium' | 'high'

export type MentorRecommendation = {
  id: string
  message: string
  priority: MentorRecommendationPriority
}
