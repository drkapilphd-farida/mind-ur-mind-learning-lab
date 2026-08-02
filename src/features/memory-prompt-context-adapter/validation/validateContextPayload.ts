import type { ContextPayload } from '../domain'
import { isSupportedPayloadVersion } from './isSupportedPayloadVersion'
import type { PayloadValidationIssue } from './PayloadValidationIssue'
import type { PayloadValidationResult } from './PayloadValidationResult'

const PRIORITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 } as const

// Pure — validates one payload in isolation (no external memories list
// needed — "Invalid mappings" here means internal reference/section
// consistency, not existence against a repository). Checks, in order:
//
// - empty-payload: no references at all across sections.
// - duplicate-reference: the same memory id appears in more than one
//   reference across the whole payload.
// - invalid-mapping: a reference's `priority` doesn't match the
//   `priority` of the section it's mapped into — a structurally
//   corrupted reference-to-section mapping.
// - ordering-violation: sections must appear in strictly descending
//   priority order.
// - incomplete-metadata: `sourcePackageId`/`generatedAt` are empty.
// - version-incompatible: `metadata.payloadVersion` isn't one this
//   engine recognizes.
export function validateContextPayload(payload: ContextPayload): PayloadValidationResult {
  const issues: PayloadValidationIssue[] = []
  const seenMemoryIds = new Set<string>()
  let totalReferences = 0

  for (const section of payload.sections) {
    for (const reference of section.references) {
      totalReferences += 1

      if (seenMemoryIds.has(reference.memoryId)) {
        issues.push({ type: 'duplicate-reference', detail: `Memory id "${reference.memoryId}" appears in more than one reference.` })
      }
      seenMemoryIds.add(reference.memoryId)

      if (reference.priority !== section.priority) {
        issues.push({
          type: 'invalid-mapping',
          detail: `Reference to "${reference.memoryId}" has priority "${reference.priority}" but is mapped into section "${section.id}" (priority "${section.priority}").`,
        })
      }
    }
  }

  if (totalReferences === 0) {
    issues.push({ type: 'empty-payload', detail: 'The payload contains no memory references.' })
  }

  for (let index = 1; index < payload.sections.length; index += 1) {
    const previous = payload.sections[index - 1]!
    const current = payload.sections[index]!
    if (PRIORITY_ORDER[previous.priority] <= PRIORITY_ORDER[current.priority]) {
      issues.push({
        type: 'ordering-violation',
        detail: `Section "${previous.id}" (${previous.priority}) does not precede "${current.id}" (${current.priority}) in strictly descending priority order.`,
      })
    }
  }

  if (payload.metadata.sourcePackageId.trim().length === 0) {
    issues.push({ type: 'incomplete-metadata', detail: 'metadata.sourcePackageId must not be empty.' })
  }
  if (payload.metadata.generatedAt.trim().length === 0) {
    issues.push({ type: 'incomplete-metadata', detail: 'metadata.generatedAt must not be empty.' })
  }

  if (!isSupportedPayloadVersion(payload.metadata.payloadVersion)) {
    issues.push({
      type: 'version-incompatible',
      detail: `Payload version ${payload.metadata.payloadVersion} is not supported by this engine.`,
    })
  }

  return { valid: issues.length === 0, issues }
}
