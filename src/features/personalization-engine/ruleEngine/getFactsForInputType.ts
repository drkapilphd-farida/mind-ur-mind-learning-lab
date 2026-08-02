import type { PersonalizationContext, PersonalizationFacts, PersonalizationRuleInputType } from '../domain'

// Pure — selects which `PersonalizationContext` bucket a given
// `PersonalizationRuleInputType` reads from.
export function getFactsForInputType(context: PersonalizationContext, inputType: PersonalizationRuleInputType): PersonalizationFacts {
  switch (inputType) {
    case 'assessment-results':
      return context.assessmentResults
    case 'learning-progress':
      return context.learningProgress
    case 'memory-context':
      return context.memoryContext
    case 'session-context':
      return context.sessionContext
    case 'configuration':
      return context.configuration
  }
}
