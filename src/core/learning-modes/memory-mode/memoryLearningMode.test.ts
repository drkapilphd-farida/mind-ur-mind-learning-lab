import { describe, expect, it } from 'vitest'
import { createLearningModeRegistry } from '@/core/learning-mode-integration'
import { memoryLearningMode } from './memoryLearningMode'

describe('memoryLearningMode', () => {
  it('registers cleanly against the real LSE-4 registry', () => {
    const registry = createLearningModeRegistry()
    registry.register(memoryLearningMode)

    expect(registry.get('memory')).toBe(memoryLearningMode)
    expect(registry.has('memory')).toBe(true)
  })

  it('declares real sessionType and chunk strategy support consistent with LSE-1/LSE-2', () => {
    expect(memoryLearningMode.capabilities.sessionType).toBe('memory')
    expect(memoryLearningMode.capabilities.supportedChunkStrategies).toEqual(['review-first', 'adaptive-queue', 'sequential'])
    expect(memoryLearningMode.capabilities.supportsCheckpoints).toBe(true)
  })

  it('registers with no adapter this sprint — presentation-layer hooks are explicitly out of scope', () => {
    expect(memoryLearningMode.adapter).toBeUndefined()
  })
})
