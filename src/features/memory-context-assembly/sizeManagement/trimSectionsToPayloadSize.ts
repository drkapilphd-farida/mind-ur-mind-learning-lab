import type { ContextSection } from '../domain'

function objectCount(sections: readonly ContextSection[]): number {
  return sections.length + sections.reduce((total, section) => total + section.references.length, 0)
}

// Pure — "object count only, not token count." Repeatedly drops one
// reference from the last (lowest-priority) section until
// `sections.length + total references <= maxPayloadSize`; a section
// left empty is dropped, which itself reduces the object count and is
// re-checked on the next iteration. Bounded: every iteration strictly
// reduces the object count, so this always terminates.
export function trimSectionsToPayloadSize(sections: readonly ContextSection[], maxPayloadSize: number): readonly ContextSection[] {
  let current = sections

  while (objectCount(current) > maxPayloadSize && current.length > 0) {
    const lastIndex = current.length - 1
    const lastSection = current[lastIndex]!

    if (lastSection.references.length > 0) {
      const remainingReferences = lastSection.references.slice(0, -1)
      const withoutLast = current.slice(0, lastIndex)
      current = remainingReferences.length > 0 ? [...withoutLast, { ...lastSection, references: remainingReferences }] : withoutLast
    } else {
      current = current.slice(0, lastIndex)
    }
  }

  return current
}
