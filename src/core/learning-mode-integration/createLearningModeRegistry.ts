import type { LearningModeType } from '@/core/adaptive-learning-runtime'
import type { LearningMode } from './types/LearningMode'
import type { LearningModeRegistry } from './types/LearningModeRegistry'

// Learning Mode Runtime Integration™ (LSE-4). The ONE shared implementation
// of the LearningMode Registry — a real, in-memory `Map` keyed by the
// mode's own real `LearningModeType`. Registering a second mode under the
// same type replaces the first, the same "last write wins" semantics a
// `Map` already gives honestly, never a silent merge of two modes'
// capabilities/adapters.
export function createLearningModeRegistry(): LearningModeRegistry {
  const modes = new Map<LearningModeType, LearningMode>()

  return {
    register: (mode) => {
      modes.set(mode.type, mode)
    },
    get: (type) => modes.get(type),
    has: (type) => modes.has(type),
    list: () => Array.from(modes.values()),
  }
}
