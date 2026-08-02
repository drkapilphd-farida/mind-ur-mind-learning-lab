import type { AdaptationRuleType } from './AdaptationRuleType'

// Immutable — every field `readonly`. A static descriptor of one
// evaluated rule — no registry this sprint (unlike Sprint 24's
// `PersonalizationStrategy`), so this carries no `condition`/`priority`
// of its own; the 5 rules are fixed, in-code functions in
// `../adaptationRules/`, catalogued by `ADAPTATION_RULES`.
export type AdaptationRule = {
  readonly id: string
  readonly type: AdaptationRuleType
  readonly description: string
}
