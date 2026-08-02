import type { ContextPayloadMetadata } from './ContextPayloadMetadata'
import type { ContextPayloadSection } from './ContextPayloadSection'

// The core immutable output model — every field `readonly`. "Produce
// immutable payload" — never mutated in place; every transformation
// returns a *new* ContextPayload value. "Provider-neutral" and
// "No provider-specific formatting" — this is still plain structured
// data, never a prompt string or an OpenAI/Anthropic/Gemini-shaped
// message array.
export type ContextPayload = {
  readonly id: string
  readonly sections: readonly ContextPayloadSection[]
  readonly metadata: ContextPayloadMetadata
}
