import type { PersonalizationProfile } from '../domain'

// "Save Profile, Load Profile, Update Profile, Delete Profile, List
// Profiles. Provider-agnostic. Dependency Injection only." The exact
// same five-method shape as every other repository across this
// session's features (e.g.
// `@/features/memory-persistence/contracts/MemoryRepository.ts`,
// independently mirrored, not imported).
export interface PersonalizationRepository {
  save(profile: PersonalizationProfile): Promise<void>
  load(id: string): Promise<PersonalizationProfile | null>
  update(profile: PersonalizationProfile): Promise<void>
  delete(id: string): Promise<void>
  list(learnerId: string): Promise<readonly PersonalizationProfile[]>
}
