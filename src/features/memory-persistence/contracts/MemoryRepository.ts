import type { Memory, MemoryId } from '../domain'

// "Create a repository abstraction... Must use dependency injection.
// No direct database calls inside business logic." — MemoryService
// (business logic) only ever talks to this interface. The one
// implementation this sprint ships (InMemoryMemoryRepository) is
// in-memory; a future real implementation (Supabase-backed) implements
// this exact same contract — every method is already `Promise`-based
// so that swap is a pure implementation change, never a signature
// change.
export interface MemoryRepository {
  save(memory: Memory): Promise<void>
  load(id: MemoryId): Promise<Memory | null>
  update(memory: Memory): Promise<void>
  delete(id: MemoryId): Promise<void>
  list(learnerId: string): Promise<readonly Memory[]>
}
