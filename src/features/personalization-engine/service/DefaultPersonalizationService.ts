import type { PersonalizationDecision, PersonalizationProfile } from '../domain'
import type { Clock, IdGenerator, PersonalizationRepository } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { createPersonalizationRepository, PersonalizationProfileNotFoundError } from '../repository'
import { moveProfileToActive, moveProfileToArchived, moveProfileToSuspended } from '../lifecycle'
import { generatePersonalizationDecision } from '../decision'
import type { EvaluationInputs } from '../integration'
import { buildPersonalizationContext } from '../integration'
import type { PersonalizationService } from './PersonalizationService'

export type PersonalizationServiceDependencies = {
  repository: PersonalizationRepository
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): PersonalizationServiceDependencies {
  return { repository: createPersonalizationRepository(), clock: systemClock, idGenerator: randomIdGenerator }
}

async function loadOrThrow(repository: PersonalizationRepository, id: string): Promise<PersonalizationProfile> {
  const profile = await repository.load(id)
  if (!profile) throw new PersonalizationProfileNotFoundError(id)
  return profile
}

// Implements PersonalizationService — composes the repository, the
// pure lifecycle transitions, and `integration/buildPersonalizationContext`
// (the one seam where "approved infrastructure" values become plain
// facts) plus `generatePersonalizationDecision`. This class is the
// only place in the feature that touches
// `@/features/memory-context-assembly`/`@/features/memory-session-context`/
// `@/features/memory-configuration-policy` types — indirectly, via
// `EvaluationInputs`'s own signature — everything it calls into stays
// self-contained.
export class DefaultPersonalizationService implements PersonalizationService {
  constructor(private readonly dependencies: PersonalizationServiceDependencies) {}

  async evaluate(profileId: string, inputs: EvaluationInputs): Promise<PersonalizationDecision> {
    const profile = await loadOrThrow(this.dependencies.repository, profileId)
    const context = buildPersonalizationContext(inputs)
    const now = this.dependencies.clock.now()
    return generatePersonalizationDecision(profile, context, now, this.dependencies.idGenerator.generate())
  }

  async activateProfile(profileId: string): Promise<PersonalizationProfile> {
    const profile = await loadOrThrow(this.dependencies.repository, profileId)
    const activated = moveProfileToActive(profile, this.dependencies.clock.now())
    await this.dependencies.repository.update(activated)
    return activated
  }

  async suspendProfile(profileId: string): Promise<PersonalizationProfile> {
    const profile = await loadOrThrow(this.dependencies.repository, profileId)
    const suspended = moveProfileToSuspended(profile, this.dependencies.clock.now())
    await this.dependencies.repository.update(suspended)
    return suspended
  }

  async archiveProfile(profileId: string): Promise<PersonalizationProfile> {
    const profile = await loadOrThrow(this.dependencies.repository, profileId)
    const archived = moveProfileToArchived(profile, this.dependencies.clock.now())
    await this.dependencies.repository.update(archived)
    return archived
  }
}

export function createPersonalizationService(overrides: Partial<PersonalizationServiceDependencies> = {}): PersonalizationService {
  return new DefaultPersonalizationService({ ...createDefaultDependencies(), ...overrides })
}
