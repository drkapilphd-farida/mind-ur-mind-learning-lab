import { describe, expect, it } from 'vitest'
import { createExecutionContextResolver } from './DefaultExecutionContextResolver'

describe('DefaultExecutionContextResolver (Context Assembly)', () => {
  it('resolves a RequestContext from the raw learner/profile/provider/model inputs', () => {
    const resolver = createExecutionContextResolver()

    const context = resolver.resolve({ learnerId: 'learner-1', profileId: 'profile-1', providerId: 'openai', modelId: 'gpt-4o' })

    expect(context).toEqual({ learnerId: 'learner-1', profileId: 'profile-1', providerId: 'openai', modelId: 'gpt-4o' })
  })

  it('does not validate — a blank input still resolves to a context', () => {
    const resolver = createExecutionContextResolver()

    const context = resolver.resolve({ learnerId: '', profileId: '', providerId: '', modelId: '' })

    expect(context).toEqual({ learnerId: '', profileId: '', providerId: '', modelId: '' })
  })
})
