import type { MentorPromptPayload } from '@/features/ai-mentor-prompt-assembler'
import type { ProviderProfileId, TranslationConfigurationFacts } from '../types'

// The raw inputs a caller supplies for one translation-orchestration
// run. `promptPayload` is required (non-null) — `ai-mentor-prompt-assembler`
// already resolved its own upstream nullability into a best-effort
// payload.
export type TranslationOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly promptPayload: MentorPromptPayload
  readonly providerId: ProviderProfileId
  readonly configurationFacts: TranslationConfigurationFacts
}
