import type { Memory, MemoryType } from '../domain'
import type { MemoryRepository, MemoryRetrievalService } from '../contracts'
import { sortByImportanceThenRecency } from './sortByImportanceThenRecency'

// Implements MemoryRetrievalService. "Deterministic ranking only. No
// embeddings. No vector search." Every method reads through the
// injected MemoryRepository — never a separate data source — and only
// ever considers `active` memories (archived/deleted memories don't
// surface in any of these 4 views).
export class DefaultMemoryRetrievalService implements MemoryRetrievalService {
  constructor(private readonly repository: MemoryRepository) {}

  async getRecentMemories(learnerId: string, limit: number): Promise<readonly Memory[]> {
    const active = await this.activeMemories(learnerId)
    return [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
  }

  async getRelevantMemories(learnerId: string, type: MemoryType, limit: number): Promise<readonly Memory[]> {
    const active = await this.activeMemories(learnerId)
    return sortByImportanceThenRecency(active.filter((memory) => memory.type === type)).slice(0, limit)
  }

  async getPinnedMemories(learnerId: string): Promise<readonly Memory[]> {
    const active = await this.activeMemories(learnerId)
    return sortByImportanceThenRecency(active.filter((memory) => memory.pinned))
  }

  async getConversationMemories(learnerId: string, limit: number): Promise<readonly Memory[]> {
    return this.getRelevantMemories(learnerId, 'conversation', limit)
  }

  private async activeMemories(learnerId: string): Promise<readonly Memory[]> {
    const memories = await this.repository.list(learnerId)
    return memories.filter((memory) => memory.lifecycle === 'active')
  }
}

export function createMemoryRetrievalService(repository: MemoryRepository): MemoryRetrievalService {
  return new DefaultMemoryRetrievalService(repository)
}
