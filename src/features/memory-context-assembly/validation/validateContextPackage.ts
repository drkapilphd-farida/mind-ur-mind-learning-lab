import type { Memory, MemoryId } from '@/features/memory-persistence'
import type { ContextPackage, ContextPriority } from '../domain'
import type { ContextSizeLimits } from '../sizeManagement'
import type { ContextValidationIssue } from './ContextValidationIssue'
import type { ContextValidationResult } from './ContextValidationResult'

const PRIORITY_ORDER: Record<ContextPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 }

// Pure — validates a finished package against the authoritative
// candidate memories it was built from and the size limits it should
// comply with. Checks, in order:
//
// - duplicate-reference: the same memory id appears in more than one
//   reference across the whole package.
// - invalid-reference: a reference's memory id isn't in `memories`.
// - empty-package: every section has zero references (or there are no
//   sections at all).
// - ordering-violation: sections must appear in strictly descending
//   priority order (critical, high, medium, low — no repeats, no
//   out-of-order pairs).
// - configuration-violation: the package still exceeds one of the
//   given `limits` (a defensive check — `sizeManagement/` should
//   already guarantee this never happens, but validation re-verifies
//   it independently rather than trusting that step blindly).
export function validateContextPackage(
  contextPackage: ContextPackage,
  memories: readonly Memory[],
  limits: ContextSizeLimits,
): ContextValidationResult {
  const issues: ContextValidationIssue[] = []
  const knownMemoryIds = new Set<MemoryId>(memories.map((memory) => memory.id))

  const seenMemoryIds = new Set<MemoryId>()
  let totalReferences = 0

  for (const section of contextPackage.sections) {
    for (const reference of section.references) {
      totalReferences += 1

      if (seenMemoryIds.has(reference.memoryId)) {
        issues.push({ type: 'duplicate-reference', detail: `Memory id "${reference.memoryId}" appears in more than one reference.` })
      }
      seenMemoryIds.add(reference.memoryId)

      if (!knownMemoryIds.has(reference.memoryId)) {
        issues.push({ type: 'invalid-reference', detail: `Reference to memory id "${reference.memoryId}" is not among the given memories.` })
      }
    }
  }

  if (totalReferences === 0) {
    issues.push({ type: 'empty-package', detail: 'The package contains no memory references.' })
  }

  for (let index = 1; index < contextPackage.sections.length; index += 1) {
    const previous = contextPackage.sections[index - 1]!
    const current = contextPackage.sections[index]!
    if (PRIORITY_ORDER[previous.priority] <= PRIORITY_ORDER[current.priority]) {
      issues.push({
        type: 'ordering-violation',
        detail: `Section "${previous.id}" (${previous.priority}) does not precede "${current.id}" (${current.priority}) in strictly descending priority order.`,
      })
    }
  }

  if (limits.maxSections !== null && contextPackage.sections.length > limits.maxSections) {
    issues.push({ type: 'configuration-violation', detail: `Package has ${contextPackage.sections.length} sections, exceeding maxSections=${limits.maxSections}.` })
  }
  if (limits.maxMemoryCount !== null && totalReferences > limits.maxMemoryCount) {
    issues.push({ type: 'configuration-violation', detail: `Package has ${totalReferences} references, exceeding maxMemoryCount=${limits.maxMemoryCount}.` })
  }
  if (limits.maxPayloadSize !== null) {
    const payloadSize = contextPackage.sections.length + totalReferences
    if (payloadSize > limits.maxPayloadSize) {
      issues.push({ type: 'configuration-violation', detail: `Package has an object count of ${payloadSize}, exceeding maxPayloadSize=${limits.maxPayloadSize}.` })
    }
  }

  return { valid: issues.length === 0, issues }
}
