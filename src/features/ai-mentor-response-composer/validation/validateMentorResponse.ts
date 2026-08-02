import type { MentorConfigurationFacts, MentorResponse, MentorResponseSectionType } from '../types'
import type { MentorResponseValidationIssue } from './MentorResponseValidationIssue'
import type { MentorResponseValidationResult } from './MentorResponseValidationResult'

// The fixed order every well-formed response's sections must appear
// in — same list as `types/MentorResponseSectionType.ts`.
const SECTION_ORDER: readonly MentorResponseSectionType[] = [
  'greeting-context',
  'learning-summary',
  'active-recommendation-summary',
  'next-action',
  'progress-summary',
  'motivation-metadata',
]

// Pure — validates a whole response together, same "issues list" shape
// as every prior engine's validator in this session. Checks, in order:
//
// - empty-response: every section has zero cards and zero actions.
// - duplicate-section: the same section `type` appears more than once
//   — defensive; structurally can't happen from the fixed 6-section
//   composer, same "checked anyway" precedent as earlier sprints.
// - missing-reference: an action's `referenceId` is blank.
// - invalid-ordering: `sections` doesn't match `SECTION_ORDER`.
// - configuration-violation: a `maxCardsPerSection` fact, if present,
//   is exceeded by any section's card count.
export function validateMentorResponse(response: MentorResponse, configurationFacts: MentorConfigurationFacts): MentorResponseValidationResult {
  const issues: MentorResponseValidationIssue[] = []

  const isEntirelyEmpty = response.sections.every((section) => section.cards.length === 0 && section.actions.length === 0)
  if (isEntirelyEmpty) {
    issues.push({ type: 'empty-response', referenceId: null, detail: 'The response contains no cards or actions in any section.' })
    return { valid: false, issues }
  }

  const seenTypes = new Set<string>()
  for (const section of response.sections) {
    if (seenTypes.has(section.type)) {
      issues.push({ type: 'duplicate-section', referenceId: null, detail: `Section type "${section.type}" appears more than once.` })
    }
    seenTypes.add(section.type)

    for (const action of section.actions) {
      if (!action.referenceId.trim()) {
        issues.push({ type: 'missing-reference', referenceId: action.id, detail: `Action "${action.id}" has an empty referenceId.` })
      }
    }
  }

  const actualOrder = response.sections.map((section) => section.type).join('|')
  const expectedOrder = SECTION_ORDER.join('|')
  if (actualOrder !== expectedOrder) {
    issues.push({ type: 'invalid-ordering', referenceId: null, detail: 'The response sections are not in the expected fixed order.' })
  }

  const maxCardsPerSection = configurationFacts.maxCardsPerSection
  if (typeof maxCardsPerSection === 'number') {
    for (const section of response.sections) {
      if (section.cards.length > maxCardsPerSection) {
        issues.push({
          type: 'configuration-violation',
          referenceId: null,
          detail: `Section "${section.type}" has ${section.cards.length} cards, exceeding configured max of ${maxCardsPerSection}.`,
        })
      }
    }
  }

  return { valid: issues.length === 0, issues }
}
