import type { PipelineConfigurationFacts, ProviderExecutionProfileId, ProviderExecutionRequest } from '../types'
import type { PipelineValidationIssue } from './PipelineValidationIssue'
import type { PipelineValidationResult } from './PipelineValidationResult'

const KNOWN_PROVIDER_IDS: readonly ProviderExecutionProfileId[] = ['openai', 'anthropic', 'gemini']

// Pure — validates a whole execution request together, same "issues
// list" shape as every prior engine's validator in this session.
// Checks, in order:
//
// - missing-field: blank `modelId`, empty `messages`, or empty
//   `context.facts`.
// - invalid-provider-profile: `providerId` outside the known 3-value
//   set — defensive; structurally can't happen from a closed union,
//   same "checked anyway" precedent as earlier sprints.
// - unsupported-version: this pipeline only supports version-1
//   requests.
// - duplicate-metadata: the same instruction id, or the same
//   `(role, content)` message pair, appears more than once.
// - configuration-violation: a `maxOutputTokens` fact, if present, is
//   exceeded by `options.maxOutputTokens`.
export function validateProviderExecutionRequest(request: ProviderExecutionRequest, configurationFacts: PipelineConfigurationFacts): PipelineValidationResult {
  const issues: PipelineValidationIssue[] = []

  if (!request.modelId.trim()) {
    issues.push({ type: 'missing-field', referenceId: null, detail: 'The request has an empty modelId.' })
  }
  if (request.messages.length === 0) {
    issues.push({ type: 'missing-field', referenceId: null, detail: 'The request has no messages.' })
  }
  if (request.context.facts.length === 0) {
    issues.push({ type: 'missing-field', referenceId: null, detail: 'The request context has no facts.' })
  }

  if (!KNOWN_PROVIDER_IDS.includes(request.providerId)) {
    issues.push({ type: 'invalid-provider-profile', referenceId: request.providerId, detail: `Provider id "${request.providerId}" is not a known profile.` })
  }

  if (request.version !== 1) {
    issues.push({ type: 'unsupported-version', referenceId: null, detail: `Request version ${request.version} is not supported (expected 1).` })
  }

  const seenInstructionIds = new Set<string>()
  for (const instruction of request.instructions) {
    if (seenInstructionIds.has(instruction.id)) {
      issues.push({ type: 'duplicate-metadata', referenceId: instruction.id, detail: `Instruction id "${instruction.id}" appears more than once.` })
    }
    seenInstructionIds.add(instruction.id)
  }

  const seenMessageKeys = new Set<string>()
  for (const message of request.messages) {
    const key = `${message.role}|${message.content}`
    if (seenMessageKeys.has(key)) {
      issues.push({ type: 'duplicate-metadata', referenceId: message.role, detail: `Message with role "${message.role}" and identical content appears more than once.` })
    }
    seenMessageKeys.add(key)
  }

  const maxOutputTokens = configurationFacts.maxOutputTokens
  if (typeof maxOutputTokens === 'number' && request.options.maxOutputTokens > maxOutputTokens) {
    issues.push({
      type: 'configuration-violation',
      referenceId: null,
      detail: `Request maxOutputTokens ${request.options.maxOutputTokens} exceeds configured max of ${maxOutputTokens}.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
