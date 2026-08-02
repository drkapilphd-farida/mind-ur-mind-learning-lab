import type { MemoryCategory, MemoryPriority, MemoryRetention } from '../types'

export type CategoryDefault = {
  priority: MemoryPriority
  retention: MemoryRetention
}

// The deterministic priority/retention every category gets by default.
// `milestone` and `achievement` are permanent, critical facts about a
// learner's journey — never worth forgetting. `exercise` (routine,
// high-volume) and `conversation` (superseded by newer conversations
// quickly) are lower priority, shorter retention. `learning-pattern`/
// `weakness`/`strength`/`preference` describe the learner themselves,
// not one event — high value, kept permanently.
export const CATEGORY_DEFAULTS: Record<MemoryCategory, CategoryDefault> = {
  assessment: { priority: 'high', retention: 'monthly' },
  journey: { priority: 'medium', retention: 'monthly' },
  exercise: { priority: 'low', retention: 'weekly' },
  conversation: { priority: 'medium', retention: 'weekly' },
  'learning-pattern': { priority: 'high', retention: 'permanent' },
  weakness: { priority: 'high', retention: 'permanent' },
  strength: { priority: 'medium', retention: 'permanent' },
  milestone: { priority: 'critical', retention: 'permanent' },
  preference: { priority: 'high', retention: 'permanent' },
  achievement: { priority: 'critical', retention: 'permanent' },
}
