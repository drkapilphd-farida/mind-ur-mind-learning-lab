import type { Memory, MemoryId } from '../domain'
import type { MemoryRepository } from '../contracts'
import { MemoryNotFoundError } from './MemoryNotFoundError'

// Implements MemoryRepository — "provide... only" this sprint's one
// shipped implementation, entirely in-memory (a private Map). Every
// method is `async` even though nothing here actually awaits, so a
// future real (e.g. Supabase-backed) implementation is a pure swap,
// never a signature change to MemoryRepository itself.
export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly records = new Map<MemoryId, Memory>()

  async save(memory: Memory): Promise<void> {
    this.records.set(memory.id, memory)
  }

  async load(id: MemoryId): Promise<Memory | null> {
    return this.records.get(id) ?? null
  }

  async update(memory: Memory): Promise<void> {
    if (!this.records.has(memory.id)) throw new MemoryNotFoundError(memory.id)
    this.records.set(memory.id, memory)
  }

  async delete(id: MemoryId): Promise<void> {
    if (!this.records.has(id)) throw new MemoryNotFoundError(id)
    this.records.delete(id)
  }

  async list(learnerId: string): Promise<readonly Memory[]> {
    return [...this.records.values()].filter((memory) => memory.metadata.learnerId === learnerId)
  }
}

export function createMemoryRepository(): MemoryRepository {
  return new InMemoryMemoryRepository()
}
