import { describe, expect, it } from 'vitest'
import { makeLearningMode } from './testFixtures'
import { validateModeConfig } from './validateModeConfig'

describe('validateModeConfig', () => {
  it('accepts a real config using a supported chunk strategy', () => {
    const mode = makeLearningMode()
    const result = validateModeConfig(mode, { learnerId: 'learner-1', chunkStrategy: 'priority-first' })

    expect(result).toEqual({ valid: true })
  })

  it('rejects a config using a chunk strategy the mode does not declare support for', () => {
    const mode = makeLearningMode({ capabilities: { sessionType: 'reading', supportedChunkStrategies: ['sequential'], supportsCheckpoints: true } })
    const result = validateModeConfig(mode, { learnerId: 'learner-1', chunkStrategy: 'adaptive-queue' })

    expect(result.valid).toBe(false)
    expect(!result.valid && result.error.code).toBe('unsupported-chunk-strategy')
  })
})
