import type { AIRequestRole } from '@/features/ai-provider/types'
import type { ProviderMessageRole } from '../types'

// The genuine AI Provider Layer™ integration seam: confirms every role
// this engine emits is a real, valid `ai-provider` role — same
// "ROLE_MAP typed against the real external role union" pattern
// `ai-mentor-provider-bridge/mapMentorPromptToAIRequest.ts` already
// established for the older `MentorPrompt` pipeline. Not called
// anywhere at runtime (this engine never produces an `AIRequest`
// itself — that's a later, explicitly-scoped sprint) — its value is
// the compile-time proof that `ProviderMessageRole`'s 3 values are
// exactly `AIRequestRole`'s 3 values, nothing more, nothing less.
export const PROVIDER_ROLE_MAP: Record<ProviderMessageRole, AIRequestRole> = {
  system: 'system',
  user: 'user',
  assistant: 'assistant',
}
