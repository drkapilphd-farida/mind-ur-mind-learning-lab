import type { Memory, MemoryId, MemoryImportance, MemoryType } from '../domain'

export type StoreMemoryInput = {
  learnerId: string
  type: MemoryType
  importance: MemoryImportance
  content: string
  source: string
  pinned?: boolean
  tags?: readonly string[]
}

// "Create orchestration service... No AI logic. No LLM calls. No
// summarization." — MemoryService composes MemoryRepository +
// MemoryCache + the pure lifecycle transitions; it never touches an AI
// provider, embeddings, or any summarization logic.
export interface MemoryService {
  storeMemory(input: StoreMemoryInput): Promise<Memory>
  retrieveMemory(id: MemoryId): Promise<Memory | null>
  archiveMemory(id: MemoryId): Promise<Memory>
  deleteMemory(id: MemoryId): Promise<void>
}
