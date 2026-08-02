import type { LearningMode } from './types/LearningMode'
import type { LearningModeConfig } from './types/LearningModeConfig'
import type { ModeConfigValidationResult } from './types/ModeConfigValidationResult'

// Learning Mode Runtime Integration™ (LSE-4). Pure. The ONE shared
// implementation — checks a real config against the real, already-declared
// `LearningModeCapabilities` of the mode it targets. `sessionType` is
// never checked here because it can no longer mismatch by construction —
// see types/LearningModeConfig.ts.
export function validateModeConfig(mode: LearningMode, config: LearningModeConfig): ModeConfigValidationResult {
  if (!mode.capabilities.supportedChunkStrategies.includes(config.chunkStrategy)) {
    return { valid: false, error: { code: 'unsupported-chunk-strategy', message: `Learning Mode "${mode.type}" does not support chunk strategy "${config.chunkStrategy}".` } }
  }

  return { valid: true }
}
