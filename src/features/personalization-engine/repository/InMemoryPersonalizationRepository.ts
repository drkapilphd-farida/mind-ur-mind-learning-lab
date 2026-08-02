import type { PersonalizationProfile } from '../domain'
import type { PersonalizationRepository } from '../contracts'
import { PersonalizationProfileNotFoundError } from './PersonalizationProfileNotFoundError'

// Implements PersonalizationRepository — this sprint's one shipped
// implementation, entirely in-memory (a private Map). Every method is
// `async` even though nothing here actually awaits, so a future real
// implementation is a pure swap, never a signature change.
export class InMemoryPersonalizationRepository implements PersonalizationRepository {
  private readonly records = new Map<string, PersonalizationProfile>()

  async save(profile: PersonalizationProfile): Promise<void> {
    this.records.set(profile.id, profile)
  }

  async load(id: string): Promise<PersonalizationProfile | null> {
    return this.records.get(id) ?? null
  }

  async update(profile: PersonalizationProfile): Promise<void> {
    if (!this.records.has(profile.id)) throw new PersonalizationProfileNotFoundError(profile.id)
    this.records.set(profile.id, profile)
  }

  async delete(id: string): Promise<void> {
    if (!this.records.has(id)) throw new PersonalizationProfileNotFoundError(id)
    this.records.delete(id)
  }

  async list(learnerId: string): Promise<readonly PersonalizationProfile[]> {
    return [...this.records.values()].filter((profile) => profile.metadata.learnerId === learnerId)
  }
}

export function createPersonalizationRepository(): PersonalizationRepository {
  return new InMemoryPersonalizationRepository()
}
