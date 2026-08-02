import type { ProviderRequest, TranslationConfigurationFacts } from '../types'
import { EXPECTED_SECTION_COUNT } from './EXPECTED_SECTION_COUNT'
import type { TranslationValidationIssue } from './TranslationValidationIssue'
import type { TranslationValidationResult } from './TranslationValidationResult'

// Pure — validates a whole translated request together, same "issues
// list" shape as every prior engine's validator in this session.
// Checks, in order:
//
// - missing-section: coverage (`messages.length`, plus 1 for the
//   Anthropic profile's folded `system-context` section) falls short
//   of `EXPECTED_SECTION_COUNT`.
// - invalid-mapping: a message has blank content, or an instruction
//   has a blank directive.
// - duplicate-mapping: the same instruction id, or the same
//   `(role, content)` message pair, appears more than once —
//   defensive; structurally can't happen from the fixed profile
//   translators, same "checked anyway" precedent as earlier sprints.
// - version-incompatible: this engine only supports version-1
//   `MentorPromptPayload`s.
// - configuration-violation: a `maxMessages` fact, if present, is
//   exceeded by the message count.
export function validateProviderRequest(
  request: ProviderRequest,
  sourcePayloadVersion: number,
  configurationFacts: TranslationConfigurationFacts,
): TranslationValidationResult {
  const issues: TranslationValidationIssue[] = []

  const anthropicFoldBonus = request.providerId === 'anthropic' ? 1 : 0
  const coverage = request.messages.length + anthropicFoldBonus
  if (coverage < EXPECTED_SECTION_COUNT) {
    issues.push({ type: 'missing-section', referenceId: null, detail: `Translated request covers ${coverage} of ${EXPECTED_SECTION_COUNT} sections.` })
  }

  for (const message of request.messages) {
    if (!message.content.trim()) {
      issues.push({ type: 'invalid-mapping', referenceId: message.role, detail: `Message with role "${message.role}" has blank content.` })
    }
  }
  for (const instruction of request.instructions) {
    if (!instruction.directive.trim()) {
      issues.push({ type: 'invalid-mapping', referenceId: instruction.id, detail: `Instruction "${instruction.id}" has a blank directive.` })
    }
  }

  const seenInstructionIds = new Set<string>()
  for (const instruction of request.instructions) {
    if (seenInstructionIds.has(instruction.id)) {
      issues.push({ type: 'duplicate-mapping', referenceId: instruction.id, detail: `Instruction id "${instruction.id}" appears more than once.` })
    }
    seenInstructionIds.add(instruction.id)
  }

  const seenMessageKeys = new Set<string>()
  for (const message of request.messages) {
    const key = `${message.role}|${message.content}`
    if (seenMessageKeys.has(key)) {
      issues.push({ type: 'duplicate-mapping', referenceId: message.role, detail: `Message with role "${message.role}" and identical content appears more than once.` })
    }
    seenMessageKeys.add(key)
  }

  if (sourcePayloadVersion !== 1) {
    issues.push({ type: 'version-incompatible', referenceId: null, detail: `Source payload version ${sourcePayloadVersion} is not supported (expected 1).` })
  }

  const maxMessages = configurationFacts.maxMessages
  if (typeof maxMessages === 'number' && request.messages.length > maxMessages) {
    issues.push({
      type: 'configuration-violation',
      referenceId: null,
      detail: `Request has ${request.messages.length} messages, exceeding configured max of ${maxMessages}.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
