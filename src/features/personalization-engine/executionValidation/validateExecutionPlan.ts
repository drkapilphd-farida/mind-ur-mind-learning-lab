import type { PersonalizationFacts } from '../domain'
import type { PersonalizationExecutionPlan } from '../executionDomain'
import type { ExecutionValidationIssue } from './ExecutionValidationIssue'
import type { ExecutionValidationResult } from './ExecutionValidationResult'

// Pure — validates a whole execution plan together, same "issues list"
// shape as `strategyValidation/validateStrategySet.ts`. Checks, in
// order:
//
// - empty-plan: the plan has no steps at all, across any sequence.
// - invalid-reference: a step's `referenceId` is blank.
// - duplicate-step: the same step `id` appears more than once in the
//   plan (sequences never share steps, so this check runs plan-wide).
// - ordering-violation: a sequence's steps aren't 0-based and strictly
//   increasing in their own `order` field.
// - configuration-violation: a `maxStepsPerSession` fact, if present,
//   is exceeded by the `session` sequence's step count.
export function validateExecutionPlan(plan: PersonalizationExecutionPlan, configurationFacts: PersonalizationFacts): ExecutionValidationResult {
  const issues: ExecutionValidationIssue[] = []
  const allSteps = plan.sequences.flatMap((sequence) => sequence.steps)

  if (allSteps.length === 0) {
    issues.push({ type: 'empty-plan', stepId: null, detail: 'The execution plan contains no steps.' })
    return { valid: false, issues }
  }

  const seenIds = new Set<string>()
  for (const step of allSteps) {
    if (!step.referenceId.trim()) {
      issues.push({ type: 'invalid-reference', stepId: step.id, detail: `Step "${step.id}" has an empty referenceId.` })
    }

    if (seenIds.has(step.id)) {
      issues.push({ type: 'duplicate-step', stepId: step.id, detail: `Step id "${step.id}" appears more than once in the plan.` })
    }
    seenIds.add(step.id)
  }

  for (const sequence of plan.sequences) {
    sequence.steps.forEach((step, index) => {
      if (step.order !== index) {
        issues.push({
          type: 'ordering-violation',
          stepId: step.id,
          detail: `Step "${step.id}" in sequence "${sequence.type}" has order ${step.order}, expected ${index}.`,
        })
      }
    })
  }

  const maxStepsPerSession = configurationFacts.maxStepsPerSession
  if (typeof maxStepsPerSession === 'number') {
    const sessionSequence = plan.sequences.find((sequence) => sequence.type === 'session')
    if (sessionSequence && sessionSequence.steps.length > maxStepsPerSession) {
      issues.push({
        type: 'configuration-violation',
        stepId: null,
        detail: `Session sequence has ${sessionSequence.steps.length} steps, exceeding configured max of ${maxStepsPerSession}.`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
