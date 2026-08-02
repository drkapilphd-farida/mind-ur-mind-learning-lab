import type { MentorContextPresence } from '../integration'
import type { MentorConfigurationFacts, MentorPersonalizationContextSnapshot } from '../types'
import type { MentorContextValidationIssue } from './MentorContextValidationIssue'
import type { MentorContextValidationResult } from './MentorContextValidationResult'

// Pure — validates a whole snapshot together, same "issues list" shape
// as every prior engine's validator in this session. Checks, in order:
//
// - missing-personalization / missing-execution-plan /
//   missing-recommendations: the 3 presence flags computed alongside
//   assembly (`../integration/buildMentorContextAssemblyInputs.ts`).
// - duplicate-reference: the same `referenceId` appears more than once
//   in `recommendations.items`, or the same `memoryId` appears more
//   than once in `memoryReferences`.
// - configuration-violation: a `maxMemoryReferences` fact, if present,
//   is exceeded by the memory references count.
export function validateMentorContext(
  snapshot: MentorPersonalizationContextSnapshot,
  presence: MentorContextPresence,
  configurationFacts: MentorConfigurationFacts,
): MentorContextValidationResult {
  const issues: MentorContextValidationIssue[] = []

  if (!presence.hasPersonalization) {
    issues.push({ type: 'missing-personalization', referenceId: null, detail: 'No Personalization Profile was available.' })
  }
  if (!presence.hasExecutionPlan) {
    issues.push({ type: 'missing-execution-plan', referenceId: null, detail: 'No Personalization Execution Plan was available.' })
  }
  if (!presence.hasRecommendations) {
    issues.push({ type: 'missing-recommendations', referenceId: null, detail: 'No active recommendations were available.' })
  }

  const seenRecommendationIds = new Set<string>()
  for (const item of snapshot.context.recommendations.items) {
    if (seenRecommendationIds.has(item.referenceId)) {
      issues.push({ type: 'duplicate-reference', referenceId: item.referenceId, detail: `Recommendation referenceId "${item.referenceId}" appears more than once.` })
    }
    seenRecommendationIds.add(item.referenceId)
  }

  const seenMemoryIds = new Set<string>()
  for (const reference of snapshot.context.memoryReferences) {
    if (seenMemoryIds.has(reference.memoryId)) {
      issues.push({ type: 'duplicate-reference', referenceId: reference.memoryId, detail: `Memory reference id "${reference.memoryId}" appears more than once.` })
    }
    seenMemoryIds.add(reference.memoryId)
  }

  const maxMemoryReferences = configurationFacts.maxMemoryReferences
  if (typeof maxMemoryReferences === 'number' && snapshot.context.memoryReferences.length > maxMemoryReferences) {
    issues.push({
      type: 'configuration-violation',
      referenceId: null,
      detail: `${snapshot.context.memoryReferences.length} memory references were assembled, exceeding configured max of ${maxMemoryReferences}.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
