import type { SafetyRule } from '../types'

// "Centralize rules" — the one place every safety constraint (no
// medical advice, no diagnosis, no hallucinated scores, no fake
// progress, no invented data, educational guidance only) is declared,
// so the Prompt Composition Engine never hardcodes its own copy of
// them.
export interface SafetyRulesEngine {
  getRules(): readonly SafetyRule[]
  formatAsPromptGuidance(): string
}
