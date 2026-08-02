import type { ContextPackage } from '@/features/memory-context-assembly'
import type { PersonalizationFacts } from '../domain'

// Pure — reduces a "Memory Context" input (a `ContextPackage` from the
// approved AI Memory Engine™) down to flat facts the rule engine can
// compare against. This is the *only* place `ContextPackage`'s own
// shape is inspected — nothing in `domain/`, `ruleEngine/`, or
// `decision/` knows this type exists.
export function buildMemoryContextFacts(contextPackage: ContextPackage | null): PersonalizationFacts {
  if (!contextPackage) return {}

  const referenceCount = contextPackage.sections.reduce((total, section) => total + section.references.length, 0)

  return {
    sectionCount: contextPackage.sections.length,
    referenceCount,
    hasCriticalSection: contextPackage.sections.some((section) => section.priority === 'critical'),
  }
}
