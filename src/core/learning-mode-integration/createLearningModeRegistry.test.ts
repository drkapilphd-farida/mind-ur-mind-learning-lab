import { describe, expect, it } from 'vitest'
import { makeLearningMode } from './testFixtures'
import { createLearningModeRegistry } from './createLearningModeRegistry'

describe('createLearningModeRegistry', () => {
  it('registers and retrieves a real mode by its real type', () => {
    const registry = createLearningModeRegistry()
    const mode = makeLearningMode()

    registry.register(mode)

    expect(registry.get('quantum-speed-reading')).toBe(mode)
    expect(registry.has('quantum-speed-reading')).toBe(true)
    expect(registry.list()).toEqual([mode])
  })

  it('returns undefined/false for an unregistered mode type', () => {
    const registry = createLearningModeRegistry()

    expect(registry.get('memory')).toBeUndefined()
    expect(registry.has('memory')).toBe(false)
    expect(registry.list()).toEqual([])
  })

  it('replaces a mode registered a second time under the same type', () => {
    const registry = createLearningModeRegistry()
    const first = makeLearningMode()
    const second = makeLearningMode({ capabilities: { ...first.capabilities, supportsCheckpoints: false } })

    registry.register(first)
    registry.register(second)

    expect(registry.get('quantum-speed-reading')).toBe(second)
    expect(registry.list()).toHaveLength(1)
  })
})
