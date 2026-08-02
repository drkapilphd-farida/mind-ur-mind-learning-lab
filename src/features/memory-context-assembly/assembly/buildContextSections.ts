import type { ContextPriority, ContextSection } from '../domain'
import type { PrioritizedMemory } from '../prioritization'

const PRIORITY_ORDER: readonly ContextPriority[] = ['critical', 'high', 'medium', 'low']

// Pure — groups prioritized memories into one section per tier, in
// strictly descending priority order; a tier with no memories is
// omitted entirely (never an empty section).
export function buildContextSections(prioritized: readonly PrioritizedMemory[]): readonly ContextSection[] {
  const sections: ContextSection[] = []

  for (const priority of PRIORITY_ORDER) {
    const matches = prioritized.filter((entry) => entry.priority === priority)
    if (matches.length === 0) continue

    sections.push({
      id: `section-${priority}`,
      priority,
      references: matches.map((entry) => ({ memoryId: entry.memory.id, priority: entry.priority, reason: entry.reason })),
    })
  }

  return sections
}
