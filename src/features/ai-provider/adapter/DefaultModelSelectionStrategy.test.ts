import { describe, expect, it } from 'vitest'
import { createModelSelectionStrategy } from './DefaultModelSelectionStrategy'
import { UnknownModelError } from '../adapters'
import { makeAIModel } from '../testFixtures'

describe('DefaultModelSelectionStrategy', () => {
  const strategy = createModelSelectionStrategy()

  it('returns the model with a matching id', () => {
    const target = makeAIModel({ id: 'target' })
    const models = [makeAIModel({ id: 'other' }), target]
    expect(strategy.selectModel(models, 'target', 'acme')).toBe(target)
  })

  it('throws UnknownModelError (Chunk 1’s, reused) for an unrecognized modelId', () => {
    const models = [makeAIModel({ id: 'known' })]
    expect(() => strategy.selectModel(models, 'missing', 'acme')).toThrow(UnknownModelError)
  })

  it('includes the given providerId in the thrown error’s message', () => {
    expect(() => strategy.selectModel([], 'missing', 'acme')).toThrow(/acme/)
  })
})
