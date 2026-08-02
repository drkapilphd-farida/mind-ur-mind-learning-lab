import type { MentorPromptContext } from './MentorPromptContext'
import type { MentorPromptInstruction } from './MentorPromptInstruction'
import type { MentorPromptMetadata } from './MentorPromptMetadata'
import type { MentorPromptSection } from './MentorPromptSection'

// Immutable — every field `readonly`. This engine's whole output — a
// structured, provider-agnostic payload. No literal name collision
// (confirmed via repo-wide grep), so unlike its 4 sibling types this
// one keeps the brief's own literal name. Structurally analogous to
// `@/features/ai-mentor/contracts/PromptBuilder.ts`'s own `MentorPrompt`
// and `@/features/ai-intelligence-layer/types/PromptPackage.ts`'s own
// `PromptPackage` — but assembly deliberately stops here: no
// translation to a provider wire format, no `ProviderAdapter` call.
export type MentorPromptPayload = {
  readonly id: string
  readonly version: number
  readonly context: MentorPromptContext
  readonly sections: readonly MentorPromptSection[]
  readonly instructions: readonly MentorPromptInstruction[]
  readonly metadata: MentorPromptMetadata
}
