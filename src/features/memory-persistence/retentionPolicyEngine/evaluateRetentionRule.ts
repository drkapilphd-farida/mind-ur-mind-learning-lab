import type { Memory } from '../domain'
import type { RetentionRule } from '../retentionDomain'

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

function ageInDays(memory: Memory, now: string): number {
  return (Date.parse(now) - Date.parse(memory.createdAt)) / MILLISECONDS_PER_DAY
}

// Pure — evaluates exactly one rule against one memory. `tag` uses AND
// semantics (a memory must carry every listed tag), the same
// convention as `specification/createTagSpecification.ts`;
// `conversation` reuses the same tag-based domain-gap workaround as
// `specification/createConversationSpecification.ts`.
export function evaluateRetentionRule(rule: RetentionRule, memory: Memory, now: string): boolean {
  switch (rule.type) {
    case 'lifecycle-state':
      return rule.states.includes(memory.lifecycle)
    case 'max-age-days':
      return ageInDays(memory, now) >= rule.maxAgeDays
    case 'importance':
      return rule.importances.includes(memory.importance)
    case 'tag':
      return rule.tags.every((tag) => memory.metadata.tags.includes(tag))
    case 'conversation':
      return memory.metadata.tags.includes(rule.conversationId)
    case 'pinned':
      return memory.pinned === rule.pinned
  }
}
