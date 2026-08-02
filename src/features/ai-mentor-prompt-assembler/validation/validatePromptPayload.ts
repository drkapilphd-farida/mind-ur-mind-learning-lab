import type { MentorConfigurationFacts, MentorPromptPayload, MentorPromptSectionType } from '../types'
import type { MentorPromptValidationIssue } from './MentorPromptValidationIssue'
import type { MentorPromptValidationResult } from './MentorPromptValidationResult'

// The fixed order/set every well-formed payload's sections must appear
// in — same list as `types/MentorPromptSectionType.ts`.
const SECTION_ORDER: readonly MentorPromptSectionType[] = ['system-context', 'learner-context', 'current-journey', 'recommendations', 'next-actions', 'metadata']

// Pure — validates a whole payload together, same "issues list" shape
// as every prior engine's validator in this session. Checks, in order:
//
// - missing-section: one of the 6 fixed section types is absent.
// - duplicate-section: the same section `type` appears more than once
//   — defensive; structurally can't happen from the fixed 6-section
//   assembler, same "checked anyway" precedent as earlier sprints.
// - invalid-ordering: `sections` doesn't match `SECTION_ORDER`.
// - invalid-reference: a blank string value inside any section.
// - configuration-violation: a `maxSectionValues` fact, if present, is
//   exceeded by any section's value count.
export function validatePromptPayload(payload: MentorPromptPayload, configurationFacts: MentorConfigurationFacts): MentorPromptValidationResult {
  const issues: MentorPromptValidationIssue[] = []

  const presentTypes = new Set(payload.sections.map((section) => section.type))
  for (const expectedType of SECTION_ORDER) {
    if (!presentTypes.has(expectedType)) {
      issues.push({ type: 'missing-section', referenceId: null, detail: `Section "${expectedType}" is missing from the payload.` })
    }
  }

  const seenTypes = new Set<string>()
  for (const section of payload.sections) {
    if (seenTypes.has(section.type)) {
      issues.push({ type: 'duplicate-section', referenceId: null, detail: `Section type "${section.type}" appears more than once.` })
    }
    seenTypes.add(section.type)

    for (const value of section.values) {
      if (!value.trim()) {
        issues.push({ type: 'invalid-reference', referenceId: section.type, detail: `Section "${section.type}" has a blank value.` })
      }
    }
  }

  const actualOrder = payload.sections.map((section) => section.type).join('|')
  const expectedOrder = SECTION_ORDER.join('|')
  if (actualOrder !== expectedOrder) {
    issues.push({ type: 'invalid-ordering', referenceId: null, detail: 'The payload sections are not in the expected fixed order.' })
  }

  const maxSectionValues = configurationFacts.maxSectionValues
  if (typeof maxSectionValues === 'number') {
    for (const section of payload.sections) {
      if (section.values.length > maxSectionValues) {
        issues.push({
          type: 'configuration-violation',
          referenceId: null,
          detail: `Section "${section.type}" has ${section.values.length} values, exceeding configured max of ${maxSectionValues}.`,
        })
      }
    }
  }

  return { valid: issues.length === 0, issues }
}
