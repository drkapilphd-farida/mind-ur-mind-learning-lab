import type { MentorPrompt, MentorPromptRole } from '@/features/ai-mentor/contracts'
import type { AIRequest, AIRequestRole } from '@/features/ai-provider/types'

// The "AI Mentor request pipeline" — translates ai-mentor's abstract,
// provider-agnostic MentorPrompt into ai-provider's wire-level AIRequest.
// This is the exact translation both features' own header comments
// deferred to "a future integration concern" (ai-provider's AIRequest
// docs) / "a future sprint... that wiring decision belongs to whichever
// sprint actually integrates a provider" (ai-mentor's ProviderAdapter
// docs) — this bridge is that sprint. 'mentor' maps to 'assistant'
// (the AI's own prior turns), 'learner' maps to 'user'.
const ROLE_MAP: Record<MentorPromptRole, AIRequestRole> = {
  system: 'system',
  mentor: 'assistant',
  learner: 'user',
}

export function mapMentorPromptToAIRequest(prompt: MentorPrompt, requestId: string, modelId: string): AIRequest {
  return {
    id: requestId,
    modelId,
    messages: prompt.messages.map((message) => ({ role: ROLE_MAP[message.role], content: message.content })),
  }
}
