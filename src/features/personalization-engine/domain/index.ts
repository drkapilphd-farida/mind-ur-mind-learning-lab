// Personalization Engine™ domain models (Sprint 23). Pure TypeScript,
// no framework dependency, fully self-contained — zero imports from
// any other feature. Every input this engine evaluates against
// (assessment results, learning progress, memory context, session
// context, configuration) is represented as flat `PersonalizationFacts`,
// never as an imported external domain type — see `PersonalizationFacts.ts`
// and `../integration/` for how real "approved infrastructure" data is
// reduced into this shape.

export type { PersonalizationLifecycleState } from './PersonalizationLifecycleState'
export type { PersonalizationMetadata } from './PersonalizationMetadata'
export type { PersonalizationFacts } from './PersonalizationFacts'
export type { PersonalizationRuleInputType } from './PersonalizationRuleInputType'
export type { PersonalizationContext } from './PersonalizationContext'
export type { PersonalizationConditionOperator } from './PersonalizationConditionOperator'
export type { PersonalizationCondition } from './PersonalizationCondition'
export type { PersonalizationDecisionType } from './PersonalizationDecisionType'
export type { PersonalizationOutcome } from './PersonalizationOutcome'
export type { PersonalizationRule } from './PersonalizationRule'
export type { PersonalizationProfile } from './PersonalizationProfile'
export type { PersonalizationRecommendation } from './PersonalizationRecommendation'
export type { PersonalizationDecision } from './PersonalizationDecision'
