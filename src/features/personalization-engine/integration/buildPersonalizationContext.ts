import type { PersonalizationContext } from '../domain'
import { buildMemoryContextFacts } from './buildMemoryContextFacts'
import { buildSessionContextFacts } from './buildSessionContextFacts'
import { buildConfigurationFacts } from './buildConfigurationFacts'
import type { EvaluationInputs } from './EvaluationInputs'

// Pure — the one function that turns real "approved infrastructure"
// values into the fully self-contained `PersonalizationContext` the
// rule engine evaluates against. This is the single seam between this
// feature's cross-feature-importing half (`integration/`) and its
// fully self-contained half (`domain/`, `ruleEngine/`, `decision/`).
export function buildPersonalizationContext(inputs: EvaluationInputs): PersonalizationContext {
  return {
    assessmentResults: inputs.assessmentResults,
    learningProgress: inputs.learningProgress,
    memoryContext: buildMemoryContextFacts(inputs.memoryContext),
    sessionContext: buildSessionContextFacts(inputs.sessionContext),
    configuration: buildConfigurationFacts(inputs.configuration),
  }
}
