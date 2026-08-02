import type { PromptCompositionInput, PromptPackage } from '../types'

// "Compose the final prompt... Return one deterministic PromptPackage."
// Pure: the same PromptCompositionInput always produces byte-identical
// output, since every field it reads is already-normalized data from
// the other engines — nothing here is randomized or time-dependent.
export interface PromptCompositionEngine {
  compose(input: PromptCompositionInput): PromptPackage
}
