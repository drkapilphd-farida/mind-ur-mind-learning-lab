import type { Memory, MemoryId } from '../domain'
import type { MemoryRepository } from '../contracts'
import type { MemorySpecification } from '../specification'
import type { QueryableMemoryRepository } from './QueryableMemoryRepository'

// Implements QueryableMemoryRepository via the Decorator pattern —
// wraps an *injected* MemoryRepository (Sprint 13's own
// InMemoryMemoryRepository, or any other implementation) rather than
// subclassing it. This is what lets this sprint "extend the repository
// contract... without breaking existing interfaces": Sprint 13's
// MemoryRepository interface and InMemoryMemoryRepository class are
// never touched, only composed with. `query()` itself is built on the
// wrapped repository's own already-existing `list()` method — no new
// data-access mechanism, just a specification applied over it.
export class DefaultQueryableMemoryRepository implements QueryableMemoryRepository {
  constructor(private readonly repository: MemoryRepository) {}

  async save(memory: Memory): Promise<void> {
    return this.repository.save(memory)
  }

  async load(id: MemoryId): Promise<Memory | null> {
    return this.repository.load(id)
  }

  async update(memory: Memory): Promise<void> {
    return this.repository.update(memory)
  }

  async delete(id: MemoryId): Promise<void> {
    return this.repository.delete(id)
  }

  async list(learnerId: string): Promise<readonly Memory[]> {
    return this.repository.list(learnerId)
  }

  async query(specification: MemorySpecification, userId: string): Promise<readonly Memory[]> {
    const memories = await this.repository.list(userId)
    return memories.filter((memory) => specification.isSatisfiedBy(memory))
  }
}

export function createQueryableMemoryRepository(repository: MemoryRepository): QueryableMemoryRepository {
  return new DefaultQueryableMemoryRepository(repository)
}
