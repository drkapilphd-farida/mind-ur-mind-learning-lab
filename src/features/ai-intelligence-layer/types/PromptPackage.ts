import type { MentorPersona } from './MentorPersona'
import type { PromptSection } from './PromptSection'

// The Prompt Composition Engine's one deterministic output —
// "Compose... Return one deterministic PromptPackage." `systemPrompt`
// already has the persona's own fragment plus every safety rule
// embedded (see DefaultPromptCompositionEngine); `sections` keeps every
// context type separately labeled so a caller (or a future real
// provider's own RequestMapper) can choose how to flatten them, rather
// than this layer deciding that for every possible provider.
export type PromptPackage = {
  systemPrompt: string
  sections: readonly PromptSection[]
  persona: MentorPersona
}
