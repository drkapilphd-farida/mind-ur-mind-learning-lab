import { describe, expect, it } from 'vitest'
import { resolveConfiguration } from './resolveConfiguration'
import { createConfigurationResolutionEngine } from './DefaultConfigurationResolutionEngine'
import { makeConfigurationProfile, makeFixedClock, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('resolveConfiguration', () => {
  it('applies precedence: default < engine < profile < runtime, later wins', () => {
    const result = resolveConfiguration(
      [{ key: 'a', value: 'default' }],
      [{ key: 'a', value: 'engine' }],
      makeConfigurationProfile({ entries: [{ key: 'a', value: 'profile' }] }),
      [{ key: 'a', value: 'runtime' }],
      NOW,
      'configuration-1',
    )
    expect(result.entries).toEqual([{ key: 'a', value: 'runtime' }])
  })

  it('a lower-precedence layer wins when no higher layer touches its key', () => {
    const result = resolveConfiguration(
      [{ key: 'a', value: 'default' }, { key: 'b', value: 'default' }],
      [{ key: 'a', value: 'engine' }],
      null,
      [],
      NOW,
      'configuration-1',
    )
    expect(result.entries).toEqual([
      { key: 'a', value: 'engine' },
      { key: 'b', value: 'default' },
    ])
  })

  it('sets metadata.profileId to null when no profile is given', () => {
    const result = resolveConfiguration([], [], null, [], NOW, 'configuration-1')
    expect(result.metadata.profileId).toBeNull()
  })

  it('sets metadata.profileId to the given profile\'s id', () => {
    const profile = makeConfigurationProfile({ id: 'profile-x' })
    const result = resolveConfiguration([], [], profile, [], NOW, 'configuration-1')
    expect(result.metadata.profileId).toBe('profile-x')
  })

  it('always produces the given id and timestamps', () => {
    const result = resolveConfiguration([], [], null, [], NOW, 'configuration-1')
    expect(result.id).toBe('configuration-1')
    expect(result.metadata.createdAt).toBe(NOW)
    expect(result.metadata.updatedAt).toBe(NOW)
  })
})

describe('DefaultConfigurationResolutionEngine', () => {
  it('resolve() uses the injected clock and id generator', () => {
    const engine = createConfigurationResolutionEngine({
      clock: makeFixedClock('2026-07-01T00:00:00.000Z'),
      idGenerator: makeSequentialIdGenerator('configuration'),
    })
    const result = engine.resolve([{ key: 'a', value: 1 }], [], null, [])
    expect(result.id).toBe('configuration-1')
    expect(result.metadata.createdAt).toBe('2026-07-01T00:00:00.000Z')
    expect(result.entries).toEqual([{ key: 'a', value: 1 }])
  })
})
