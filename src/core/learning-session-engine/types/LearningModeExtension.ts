import type { LearningChunk } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningSession } from './LearningSession'
import type { SessionEvent } from './SessionEvent'

// Universal Learning Session Engine™ (LSE-1) — RESERVED extension
// point. "Reserve interfaces for future Learning Modes... No Learning
// Mode implementation yet." Every named Learning Mode this brief lists
// maps to one real value here — no logic, no registry, no adapter
// implemented this sprint.
//
// AI Learning Studio™ Sprint ALS-16 amendment: 'focus-mode' added —
// Focus Mode™ (Mini) is a real, registered Learning Mode
// (`src/core/learning-modes/focus-mode/focusLearningMode.ts`), matching
// this same value.
export type LearningModeType = 'quantum-speed-reading' | 'memory' | 'smart-notes' | 'mind-map' | 'flashcards' | 'mcqs' | 'revision' | 'research' | 'ai-mentor' | 'focus-mode'

// The reserved shape a future Learning Mode would implement to plug
// into the generic session runtime — e.g. Quantum Speed Reading™ reacts
// to `onChunkStarted` to control pacing; Memory Mode™ reacts to
// `onSessionCompleted` to schedule real revision. Every method is
// optional (a mode only implements what it cares about) and returns
// `void` — this sprint reserves the shape only; no session action
// actually calls into a `LearningModeAdapter` yet, and no concrete
// adapter is implemented for any named mode.
export type LearningModeAdapter = {
  type: LearningModeType
  onSessionStarted?: (session: LearningSession) => void
  onChunkStarted?: (session: LearningSession, chunk: LearningChunk) => void
  onChunkCompleted?: (session: LearningSession, chunk: LearningChunk) => void
  onCheckpointReached?: (session: LearningSession, event: Extract<SessionEvent, { type: 'checkpoint-reached' }>) => void
  onSessionCompleted?: (session: LearningSession) => void
}
