import { describe, expect, it } from 'vitest'
import { ALL_PROVIDERS } from './index'
import { createProviderValidator } from '../validation'

describe('ALL_PROVIDERS catalog', () => {
  it('has a unique metadata.id per provider', () => {
    const ids = ALL_PROVIDERS.map((provider) => provider.metadata.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every provider passes structural validation', () => {
    const validator = createProviderValidator()
    for (const provider of ALL_PROVIDERS) {
      expect(validator.validateProvider(provider)).toEqual({ valid: true, errors: [] })
    }
  })

  it('every model declares at least the chat capability', () => {
    for (const provider of ALL_PROVIDERS) {
      for (const model of provider.models) {
        expect(model.capabilities.chat).toBe(true)
      }
    }
  })
})
