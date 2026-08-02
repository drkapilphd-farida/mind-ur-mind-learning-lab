import { describe, expect, it } from 'vitest'
import { createLearningModeRegistry } from '@/core/learning-mode-integration'
import { quantumSpeedReadingMode } from './qsrLearningMode'

describe('quantumSpeedReadingMode', () => {
  it('registers cleanly against the real LSE-4 registry', () => {
    const registry = createLearningModeRegistry()
    registry.register(quantumSpeedReadingMode)

    expect(registry.get('quantum-speed-reading')).toBe(quantumSpeedReadingMode)
    expect(registry.has('quantum-speed-reading')).toBe(true)
  })

  it('declares real sessionType and chunk strategy support consistent with LSE-1/LSE-2', () => {
    expect(quantumSpeedReadingMode.capabilities.sessionType).toBe('reading')
    expect(quantumSpeedReadingMode.capabilities.supportedChunkStrategies).toEqual(['sequential', 'priority-first', 'dependency-first', 'review-first', 'adaptive-queue'])
    expect(quantumSpeedReadingMode.capabilities.supportsCheckpoints).toBe(true)
  })

  it('registers with no adapter this sprint — presentation-layer hooks are explicitly out of scope', () => {
    expect(quantumSpeedReadingMode.adapter).toBeUndefined()
  })
})
