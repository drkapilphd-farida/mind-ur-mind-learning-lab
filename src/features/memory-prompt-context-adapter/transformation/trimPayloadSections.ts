import type { ContextSizeLimits } from '@/features/memory-context-assembly'
import type { ContextPayloadSection } from '../domain'

function objectCount(sections: readonly ContextPayloadSection[]): number {
  return sections.length + sections.reduce((total, section) => total + section.references.length, 0)
}

// Pure — "Configuration-derived limits": an *additional*, payload-level
// trim pass, independent of whatever limits `@/features/memory-context-assembly`
// already applied to the source `ContextPackage`. Mirrors that
// feature's own `sizeManagement` trimming semantics (trim from the
// lowest-priority end, drop emptied sections) — re-implemented here
// rather than imported, since `ContextPayloadSection` is a distinct
// type from `ContextSection`.
export function trimPayloadSections(sections: readonly ContextPayloadSection[], limits: ContextSizeLimits): readonly ContextPayloadSection[] {
  let result = sections

  if (limits.maxSections !== null && result.length > limits.maxSections) {
    result = result.slice(0, limits.maxSections)
  }

  if (limits.maxMemoryCount !== null) {
    let remaining = limits.maxMemoryCount
    const trimmed: ContextPayloadSection[] = []
    for (const section of result) {
      if (remaining <= 0) break
      const keptReferences = section.references.slice(0, remaining)
      remaining -= keptReferences.length
      if (keptReferences.length > 0) trimmed.push({ ...section, references: keptReferences })
    }
    result = trimmed
  }

  if (limits.maxPayloadSize !== null) {
    while (objectCount(result) > limits.maxPayloadSize && result.length > 0) {
      const lastIndex = result.length - 1
      const lastSection = result[lastIndex]!
      if (lastSection.references.length > 0) {
        const remainingReferences = lastSection.references.slice(0, -1)
        const withoutLast = result.slice(0, lastIndex)
        result = remainingReferences.length > 0 ? [...withoutLast, { ...lastSection, references: remainingReferences }] : withoutLast
      } else {
        result = result.slice(0, lastIndex)
      }
    }
  }

  return result
}
