// Universal Learning Session Engine™ (LSE-1) — the one public import
// path. Consumes ONLY the Universal Learning Object™
// (`@/core/universal-learning-engine/universal-learning-object`);
// never imports raw documents, chunks, the knowledge graph, or
// learning analysis directly. Reserves (type-only, unimplemented)
// extension points for future Learning Modes™ and personalization.
export type {
  SessionStatus,
  SessionPosition,
  LearningQueueItem,
  LearningQueue,
  SessionEventType,
  SessionEvent,
  SessionProgress,
  SessionVersion,
  LearningSession,
  LearningModeType,
  LearningModeAdapter,
  SessionActionErrorCode,
  SessionActionError,
  SessionActionOptions,
  SessionActionResult,
} from './types'

export { startSession } from './actions/startSession'
export { continueSession } from './actions/continueSession'
export { pauseSession } from './actions/pauseSession'
export { resumeSession } from './actions/resumeSession'
export { completeSession } from './actions/completeSession'
export { cancelSession } from './actions/cancelSession'
export { restartSession } from './actions/restartSession'
