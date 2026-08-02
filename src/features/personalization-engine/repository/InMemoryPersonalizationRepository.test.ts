import { describe, expect, it } from 'vitest'
import { createPersonalizationRepository } from './InMemoryPersonalizationRepository'
import { PersonalizationProfileNotFoundError } from './PersonalizationProfileNotFoundError'
import { makePersonalizationProfile } from '../testFixtures'

describe('InMemoryPersonalizationRepository', () => {
  it('save() then load() returns the same profile', async () => {
    const repository = createPersonalizationRepository()
    const profile = makePersonalizationProfile()
    await repository.save(profile)
    expect(await repository.load(profile.id)).toEqual(profile)
  })

  it('load() returns null for an unknown id', async () => {
    const repository = createPersonalizationRepository()
    expect(await repository.load('does-not-exist')).toBeNull()
  })

  it('save() overwrites an existing entry with the same id', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ lifecycle: 'created' }))
    await repository.save(makePersonalizationProfile({ lifecycle: 'active' }))
    expect((await repository.load('profile-1'))?.lifecycle).toBe('active')
  })

  it('update() modifies an existing profile', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ lifecycle: 'created' }))
    await repository.update(makePersonalizationProfile({ lifecycle: 'active' }))
    expect((await repository.load('profile-1'))?.lifecycle).toBe('active')
  })

  it('update() throws PersonalizationProfileNotFoundError for an unsaved id', async () => {
    const repository = createPersonalizationRepository()
    await expect(repository.update(makePersonalizationProfile())).rejects.toThrow(PersonalizationProfileNotFoundError)
  })

  it('delete() removes the profile', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile())
    await repository.delete('profile-1')
    expect(await repository.load('profile-1')).toBeNull()
  })

  it('delete() throws PersonalizationProfileNotFoundError for an unsaved id', async () => {
    const repository = createPersonalizationRepository()
    await expect(repository.delete('does-not-exist')).rejects.toThrow(PersonalizationProfileNotFoundError)
  })

  it('list() returns only the given learner\'s profiles', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makePersonalizationProfile({ id: 'b', metadata: { learnerId: 'learner-2', source: 's', tags: [] } }))
    const results = await repository.list('learner-1')
    expect(results.map((profile) => profile.id)).toEqual(['a'])
  })
})
