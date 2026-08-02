import type { ProviderMessageRole } from './ProviderMessageRole'

// Immutable — every field `readonly`. `content` is always a
// deterministic join of already-structured `MentorPromptPayload`
// values — never generated prose, same discipline as
// `MentorResponseCard.values`/`MentorPromptSection.values`.
export type ProviderMessage = {
  readonly role: ProviderMessageRole
  readonly content: string
}
