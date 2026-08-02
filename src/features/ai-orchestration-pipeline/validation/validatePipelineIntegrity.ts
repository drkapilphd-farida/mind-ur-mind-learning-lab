import type { AIOrchestrationResult, OrchestrationConfigurationFacts, PipelineStage } from '../types'
import { PIPELINE_STAGE_ORDER } from '../pipeline'
import type { PipelineValidationIssue } from './PipelineValidationIssue'
import type { PipelineValidationResult } from './PipelineValidationResult'

// Pure — validates a whole orchestration result together, same "issues
// list" shape as every prior engine's validator in this session.
// Checks, in order:
//
// - missing-stage: when `completionStatus === 'completed'`, every
//   stage in the fixed success path is present in `completedStages`.
// - invalid-transition: the non-`failed` entries of `completedStages`
//   match `PIPELINE_STAGE_ORDER`'s own prefix order — defensive, same
//   "checked anyway" precedent as earlier sprints (the orchestrator
//   itself can't produce an out-of-order list by construction).
// - duplicate-execution: the same stage appears more than once in
//   `completedStages` — defensive, same reasoning.
// - configuration-violation: a `maxPipelineStages` fact, if present,
//   is exceeded by `completedStages.length`.
// - pipeline-integrity: `completionStatus === 'completed'` but
//   `responseText` is `null` — an internally inconsistent result.
export function validatePipelineIntegrity(result: AIOrchestrationResult, configurationFacts: OrchestrationConfigurationFacts): PipelineValidationResult {
  const issues: PipelineValidationIssue[] = []
  const { completedStages } = result.context

  if (result.completionStatus === 'completed') {
    for (const stage of PIPELINE_STAGE_ORDER) {
      if (!completedStages.includes(stage)) {
        issues.push({ type: 'missing-stage', stage, detail: `Stage "${stage}" is missing from completedStages.` })
      }
    }
  }

  const successStages = completedStages.filter((stage) => stage !== 'failed')
  const expectedPrefix = PIPELINE_STAGE_ORDER.slice(0, successStages.length)
  const orderMatches = successStages.every((stage, index) => stage === expectedPrefix[index])
  if (!orderMatches) {
    issues.push({ type: 'invalid-transition', stage: null, detail: 'completedStages does not match the expected pipeline stage order.' })
  }

  const seen = new Set<PipelineStage>()
  for (const stage of completedStages) {
    if (seen.has(stage)) {
      issues.push({ type: 'duplicate-execution', stage, detail: `Stage "${stage}" appears more than once in completedStages.` })
    }
    seen.add(stage)
  }

  const maxPipelineStages = configurationFacts.maxPipelineStages
  if (typeof maxPipelineStages === 'number' && completedStages.length > maxPipelineStages) {
    issues.push({
      type: 'configuration-violation',
      stage: null,
      detail: `completedStages has ${completedStages.length} entries, exceeding configured max of ${maxPipelineStages}.`,
    })
  }

  if (result.completionStatus === 'completed' && result.responseText === null) {
    issues.push({ type: 'pipeline-integrity', stage: null, detail: 'Pipeline reports completed but has no responseText.' })
  }

  return { valid: issues.length === 0, issues }
}
