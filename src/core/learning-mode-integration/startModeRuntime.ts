import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { LearningModeType, RuntimeActionOptions } from '@/core/adaptive-learning-runtime'
import { startRuntime } from '@/core/adaptive-learning-runtime'
import type { LearningModeRegistry } from './types/LearningModeRegistry'
import type { LearningModeConfig } from './types/LearningModeConfig'
import type { ModeIntegrationResult } from './types/ModeIntegrationResult'
import { validateModeConfig } from './validateModeConfig'
import { dispatchRuntimeEvents } from './dispatchRuntimeEvents'

// Learning Mode Runtime Integration™ (LSE-4). The real integration
// entrypoint: look up the real registered mode, validate the real config
// against its real declared capabilities, delegate entirely to LSE-2's own
// public `startRuntime` for the actual runtime construction (never
// reimplemented here), then call the real `onRuntimeStarted` hook once
// (there is no matching `RuntimeEvent` for it — see
// dispatchRuntimeEvents.ts) before forwarding the real initial events
// through the same shared dispatcher every other decision uses.
export function startModeRuntime(registry: LearningModeRegistry, modeType: LearningModeType, ulo: UniversalLearningObject, config: LearningModeConfig, options: RuntimeActionOptions = {}): ModeIntegrationResult {
  const mode = registry.get(modeType)
  if (!mode) return { success: false, error: { code: 'mode-not-registered', message: `No Learning Mode registered for type "${modeType}".` } }

  const validation = validateModeConfig(mode, config)
  if (!validation.valid) return { success: false, error: validation.error }

  const result = startRuntime(ulo, config.learnerId, mode.capabilities.sessionType, config.chunkStrategy, options)
  if (!result.success) return result

  mode.adapter?.onRuntimeStarted?.(result.state)
  dispatchRuntimeEvents(mode, ulo, result.state, result.events)

  return result
}
