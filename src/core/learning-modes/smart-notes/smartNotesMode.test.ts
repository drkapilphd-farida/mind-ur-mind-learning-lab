import { describe, expect, it } from 'vitest'
import { createLearningModeRegistry } from '@/core/learning-mode-integration'
import { smartNotesMode } from './smartNotesMode'

describe('smartNotesMode', () => {
  it('registers cleanly against the real LSE-4 registry', () => {
    const registry = createLearningModeRegistry()
    registry.register(smartNotesMode)

    expect(registry.get('smart-notes')).toBe(smartNotesMode)
    expect(registry.has('smart-notes')).toBe(true)
  })

  it('declares real sessionType and chunk strategy support consistent with LSE-1/LSE-2', () => {
    expect(smartNotesMode.capabilities.sessionType).toBe('smart-notes')
    expect(smartNotesMode.capabilities.supportedChunkStrategies).toEqual(['sequential', 'priority-first', 'dependency-first'])
    expect(smartNotesMode.capabilities.supportsCheckpoints).toBe(true)
  })

  it('registers with no adapter this sprint — presentation-layer hooks are explicitly out of scope', () => {
    expect(smartNotesMode.adapter).toBeUndefined()
  })
})
