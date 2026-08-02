import type { Memory, MemoryType } from '../domain'

// "Implementation may initially use deterministic ranking only. No
// embeddings. No vector search." — every method here is a plain,
// deterministic filter + sort over MemoryRepository.list()'s result.
export interface MemoryRetrievalService {
  getRecentMemories(learnerId: string, limit: number): Promise<readonly Memory[]>
  getRelevantMemories(learnerId: string, type: MemoryType, limit: number): Promise<readonly Memory[]>
  getPinnedMemories(learnerId: string): Promise<readonly Memory[]>
  getConversationMemories(learnerId: string, limit: number): Promise<readonly Memory[]>
}
