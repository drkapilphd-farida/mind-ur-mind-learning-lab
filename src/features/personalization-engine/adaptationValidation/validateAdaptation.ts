import type { PersonalizationFacts } from '../domain'
import type { PersonalizationAdaptation } from '../adaptationDomain'
import type { AdaptationValidationIssue } from './AdaptationValidationIssue'
import type { AdaptationValidationResult } from './AdaptationValidationResult'

// Pure — validates a whole adaptation together, same "issues list"
// shape as `executionValidation`/`recommendationValidation`. Checks, in
// order:
//
// - empty-adaptation-set: no results at all.
// - invalid-profile-reference: `adaptation.profileId` doesn't match the
//   profile the orchestrator actually evaluated against.
// - duplicate-adaptation: the same `ruleId` appears more than once.
// - rule-conflict: two *applied* results share the same `type` —
//   defensive; structurally can't happen from the fixed 1:1 rule set in
//   `../adaptationRules/`, same "checked anyway" precedent as Sprint
//   24's circular-reference / Sprint 25-26's ordering-violation checks.
// - configuration-violation: a `maxAppliedAdaptations` fact, if
//   present, is exceeded by the count of applied results.
export function validateAdaptation(
  adaptation: PersonalizationAdaptation,
  expectedProfileId: string,
  configurationFacts: PersonalizationFacts,
): AdaptationValidationResult {
  const issues: AdaptationValidationIssue[] = []

  if (adaptation.results.length === 0) {
    issues.push({ type: 'empty-adaptation-set', ruleId: null, detail: 'The adaptation contains no results.' })
    return { valid: false, issues }
  }

  if (adaptation.profileId !== expectedProfileId) {
    issues.push({
      type: 'invalid-profile-reference',
      ruleId: null,
      detail: `Adaptation profileId "${adaptation.profileId}" does not match the expected profile "${expectedProfileId}".`,
    })
  }

  const seenRuleIds = new Set<string>()
  const seenAppliedTypes = new Set<string>()
  for (const result of adaptation.results) {
    if (seenRuleIds.has(result.ruleId)) {
      issues.push({ type: 'duplicate-adaptation', ruleId: result.ruleId, detail: `Rule id "${result.ruleId}" appears more than once in the adaptation.` })
    }
    seenRuleIds.add(result.ruleId)

    if (result.applied) {
      if (seenAppliedTypes.has(result.type)) {
        issues.push({ type: 'rule-conflict', ruleId: result.ruleId, detail: `More than one applied adaptation targets type "${result.type}".` })
      }
      seenAppliedTypes.add(result.type)
    }
  }

  const maxAppliedAdaptations = configurationFacts.maxAppliedAdaptations
  if (typeof maxAppliedAdaptations === 'number') {
    const appliedCount = adaptation.results.filter((result) => result.applied).length
    if (appliedCount > maxAppliedAdaptations) {
      issues.push({
        type: 'configuration-violation',
        ruleId: null,
        detail: `${appliedCount} adaptations were applied, exceeding configured max of ${maxAppliedAdaptations}.`,
      })
    }
  }

  return { valid: issues.length === 0, issues }
}
