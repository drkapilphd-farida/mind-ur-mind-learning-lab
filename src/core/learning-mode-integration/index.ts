// Learning Mode Runtime Integration™ (LSE-4) — the one public import path.
// Consumes ONLY the Universal Learning Object™, LSE-2's own public barrel,
// and LSE-3's own public barrel; never a lower engine, never another
// layer's internal/. Adds the registry, dispatch, capability validation,
// and progress synchronization every Learning Mode plugs into — never a
// second `LearningSession`, session state machine, session lifecycle,
// progress computation, or event type. Every one of LSE-1/LSE-2/LSE-3's
// own capabilities is reused verbatim through their own public barrels.
export type {
  LearningModeCapabilities,
  LearningModeConfig,
  LearningMode,
  LearningModeRegistry,
  ModeIntegrationErrorCode,
  ModeIntegrationError,
  ModeConfigValidationResult,
  ModeIntegrationResult,
  SynchronizedModeProgress,
} from './types'

export { createLearningModeRegistry } from './createLearningModeRegistry'
export { validateModeConfig } from './validateModeConfig'
export { dispatchRuntimeEvents } from './dispatchRuntimeEvents'
export { dispatchAfterDecision } from './dispatchAfterDecision'
export { synchronizeModeProgress } from './synchronizeModeProgress'
export { startModeRuntime } from './startModeRuntime'
