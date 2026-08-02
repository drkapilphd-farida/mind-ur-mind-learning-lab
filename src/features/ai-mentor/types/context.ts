import type { MentorInsight } from './insight'
import type { MentorMessage } from './message'
import type { MentorRecommendation } from './recommendation'

// ContextBuilder's (Chunk 3) output shape — everything a PromptBuilder
// or a future real ProviderAdapter needs to produce a mentor reply,
// assembled from this feature's own state (conversation history,
// insights, recommendations, memory), never from a live model call.
export type MentorContext = {
  learningProjectId: string
  recentMessages: readonly MentorMessage[]
  insights: readonly MentorInsight[]
  recommendations: readonly MentorRecommendation[]
  memory: readonly string[]
}
