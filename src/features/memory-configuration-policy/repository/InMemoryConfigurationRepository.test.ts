import { describe, expect, it } from 'vitest'
import { createConfigurationRepository } from './InMemoryConfigurationRepository'
import { makeMemoryConfiguration } from '../testFixtures'

describe('InMemoryConfigurationRepository', () => {
  it('save() then retrieve() returns the same configuration', async () => {
    const repository = createConfigurationRepository()
    const configuration = makeMemoryConfiguration()
    await repository.save(configuration)
    expect(await repository.retrieve(configuration.id)).toEqual(configuration)
  })

  it('retrieve() returns null for an unknown id', async () => {
    const repository = createConfigurationRepository()
    expect(await repository.retrieve('does-not-exist')).toBeNull()
  })

  it('save() overwrites an existing entry with the same id', async () => {
    const repository = createConfigurationRepository()
    await repository.save(makeMemoryConfiguration({ entries: [{ key: 'a', value: 1 }] }))
    await repository.save(makeMemoryConfiguration({ entries: [{ key: 'a', value: 2 }] }))
    expect((await repository.retrieve('configuration-1'))?.entries).toEqual([{ key: 'a', value: 2 }])
  })
})
