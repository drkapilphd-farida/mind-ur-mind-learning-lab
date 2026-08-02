import type { LearningModeType } from '@/core/adaptive-learning-runtime'
import type { LearningMode } from './LearningMode'

// Learning Mode Runtime Integration™ (LSE-4). The LearningMode Registry
// contract — a real, in-memory catalog of which concrete Learning Modes
// are registered in this process. Adding a future Learning Mode (Memory
// Mode™, Flashcards™, ...) is calling `register()` with a new real
// `LearningMode` value — never a change to this interface or to any
// function in this layer.
export type LearningModeRegistry = {
  register: (mode: LearningMode) => void
  get: (type: LearningModeType) => LearningMode | undefined
  has: (type: LearningModeType) => boolean
  list: () => readonly LearningMode[]
}
