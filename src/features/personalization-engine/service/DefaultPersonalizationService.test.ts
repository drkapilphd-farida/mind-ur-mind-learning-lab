import { describe, expect, it } from 'vitest'
import { createPersonalizationService } from './DefaultPersonalizationService'
import { createPersonalizationRepository } from '../repository'
import { PersonalizationProfileNotFoundError } from '../repository'
import { IllegalPersonalizationLifecycleTransitionError } from '../lifecycle'
import { makeFixedClock, makePersonalizationProfile, makePersonalizationRule, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'
const EMPTY_INPUTS = { assessmentResults: {}, learningProgress: {}, memoryContext: null, sessionContext: null, configuration: null }

describe('DefaultPersonalizationService', () => {
  it('evaluate() loads the profile and produces a decision from its rules', async () => {
    const repository = createPersonalizationRepository()
    const profile = makePersonalizationProfile({
      rules: [
        makePersonalizationRule({
          id: 'r1',
          condition: { inputType: 'assessment-results', factKey: 'accuracy', operator: 'greater-than', value: 0.8 },
        }),
      ],
    })
    await repository.save(profile)

    const service = createPersonalizationService({
      repository,
      clock: makeFixedClock(NOW),
      idGenerator: makeSequentialIdGenerator('decision'),
    })
    const decision = await service.evaluate(profile.id, { ...EMPTY_INPUTS, assessmentResults: { accuracy: 0.9 } })

    expect(decision.id).toBe('decision-1')
    expect(decision.profileId).toBe(profile.id)
    expect(decision.generatedAt).toBe(NOW)
    expect(decision.recommendations).toHaveLength(1)
  })

  it('evaluate() throws PersonalizationProfileNotFoundError for an unknown profile', async () => {
    const service = createPersonalizationService()
    await expect(service.evaluate('does-not-exist', EMPTY_INPUTS)).rejects.toThrow(PersonalizationProfileNotFoundError)
  })

  it('activateProfile() transitions and persists the profile', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ lifecycle: 'created' }))

    const service = createPersonalizationService({ repository, clock: makeFixedClock(NOW) })
    const activated = await service.activateProfile('profile-1')

    expect(activated.lifecycle).toBe('active')
    expect((await repository.load('profile-1'))?.lifecycle).toBe('active')
  })

  it('suspendProfile() transitions and persists the profile', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ lifecycle: 'active' }))

    const service = createPersonalizationService({ repository, clock: makeFixedClock(NOW) })
    const suspended = await service.suspendProfile('profile-1')

    expect(suspended.lifecycle).toBe('suspended')
    expect((await repository.load('profile-1'))?.lifecycle).toBe('suspended')
  })

  it('archiveProfile() transitions and persists the profile', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ lifecycle: 'active' }))

    const service = createPersonalizationService({ repository, clock: makeFixedClock(NOW) })
    const archived = await service.archiveProfile('profile-1')

    expect(archived.lifecycle).toBe('archived')
    expect((await repository.load('profile-1'))?.lifecycle).toBe('archived')
  })

  it('lifecycle methods throw PersonalizationProfileNotFoundError for an unknown profile', async () => {
    const service = createPersonalizationService()
    await expect(service.activateProfile('does-not-exist')).rejects.toThrow(PersonalizationProfileNotFoundError)
    await expect(service.suspendProfile('does-not-exist')).rejects.toThrow(PersonalizationProfileNotFoundError)
    await expect(service.archiveProfile('does-not-exist')).rejects.toThrow(PersonalizationProfileNotFoundError)
  })

  it('propagates illegal lifecycle transitions', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ lifecycle: 'archived' }))

    const service = createPersonalizationService({ repository, clock: makeFixedClock(NOW) })
    await expect(service.activateProfile('profile-1')).rejects.toThrow(IllegalPersonalizationLifecycleTransitionError)
  })

  it('uses default dependencies when no overrides are given', async () => {
    const service = createPersonalizationService()
    await expect(service.evaluate('does-not-exist', EMPTY_INPUTS)).rejects.toThrow(PersonalizationProfileNotFoundError)
  })

  it('exercises the real system clock via default dependencies on a successful lifecycle call', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile({ lifecycle: 'created' }))

    const service = createPersonalizationService({ repository })
    const activated = await service.activateProfile('profile-1')

    expect(activated.lifecycle).toBe('active')
    expect(activated.updatedAt).toBeTruthy()
  })

  it('exercises the real id generator via default dependencies on a successful evaluate() call', async () => {
    const repository = createPersonalizationRepository()
    await repository.save(makePersonalizationProfile())

    const service = createPersonalizationService({ repository })
    const decision = await service.evaluate('profile-1', EMPTY_INPUTS)

    expect(decision.id).toBeTruthy()
  })
})
