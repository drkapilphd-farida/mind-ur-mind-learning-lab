import type { SafetyRule } from '../types'
import type { SafetyRulesEngine } from '../contracts'
import { SAFETY_RULES } from './SAFETY_RULES'

// Implements SafetyRulesEngine. `formatAsPromptGuidance` is what the
// Prompt Composition Engine embeds into `systemPrompt` — a deterministic
// bullet list, so the rendered prompt is stable across runs.
export class DefaultSafetyRulesEngine implements SafetyRulesEngine {
  getRules(): readonly SafetyRule[] {
    return SAFETY_RULES
  }

  formatAsPromptGuidance(): string {
    return SAFETY_RULES.map((rule) => `- ${rule.description}`).join('\n')
  }
}

export function createSafetyRulesEngine(): SafetyRulesEngine {
  return new DefaultSafetyRulesEngine()
}
