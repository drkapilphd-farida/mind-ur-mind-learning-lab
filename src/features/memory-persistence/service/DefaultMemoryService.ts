import type { Memory, MemoryId } from '../domain'
import type { Clock, IdGenerator, MemoryCache, MemoryRepository, MemoryService, StoreMemoryInput } from '../contracts'
import { moveMemoryToActive, moveMemoryToArchived } from '../lifecycle'
import { createMemoryRepository, MemoryNotFoundError } from '../repository'
import { createMemoryCache } from '../cache'
import { randomIdGenerator, systemClock } from '../adapters'

export type MemoryServiceDependencies = {
  repository: MemoryRepository
  cache: MemoryCache
  idGenerator: IdGenerator
  clock: Clock
}

function createDefaultDependencies(): MemoryServiceDependencies {
  return {
    repository: createMemoryRepository(),
    cache: createMemoryCache(),
    idGenerator: randomIdGenerator,
    clock: systemClock,
  }
}

// Implements MemoryService — "No AI logic. No LLM calls. No
// summarization." Composes MemoryRepository + MemoryCache + the pure
// lifecycle transitions; the cache is always checked before falling
// back to the repository, and always populated after a repository read
// — "no direct database calls inside business logic" holds because
// this class only ever calls through the injected MemoryRepository
// interface, never a real database client directly.
export class DefaultMemoryService implements MemoryService {
  constructor(private readonly dependencies: MemoryServiceDependencies) {}

  async storeMemory(input: StoreMemoryInput): Promise<Memory> {
    const now = this.dependencies.clock.now()

    const created: Memory = {
      id: this.dependencies.idGenerator.generate(),
      type: input.type,
      importance: input.importance,
      content: input.content,
      pinned: input.pinned ?? false,
      metadata: { learnerId: input.learnerId, source: input.source, tags: input.tags ?? [] },
      lifecycle: 'created',
      createdAt: now,
      updatedAt: now,
    }

    const active = moveMemoryToActive(created, now)
    await this.dependencies.repository.save(active)
    this.dependencies.cache.set(active)
    return active
  }

  async retrieveMemory(id: MemoryId): Promise<Memory | null> {
    const cached = this.dependencies.cache.get(id)
    if (cached) return cached

    const loaded = await this.dependencies.repository.load(id)
    if (loaded) this.dependencies.cache.set(loaded)
    return loaded
  }

  async archiveMemory(id: MemoryId): Promise<Memory> {
    const memory = await this.retrieveMemory(id)
    if (!memory) throw new MemoryNotFoundError(id)

    const archived = moveMemoryToArchived(memory, this.dependencies.clock.now())
    await this.dependencies.repository.update(archived)
    this.dependencies.cache.set(archived)
    return archived
  }

  async deleteMemory(id: MemoryId): Promise<void> {
    const memory = await this.retrieveMemory(id)
    if (!memory) throw new MemoryNotFoundError(id)

    await this.dependencies.repository.delete(id)
    this.dependencies.cache.remove(id)
  }
}

export function createMemoryService(overrides: Partial<MemoryServiceDependencies> = {}): MemoryService {
  return new DefaultMemoryService({ ...createDefaultDependencies(), ...overrides })
}
