import type { MemoryCategory } from './MemoryCategory'
import type { MemoryPriority } from './MemoryPriority'
import type { MemoryRetention } from './MemoryRetention'

// MemoryBuilder's™ output — one classified, stored memory.
// `vectorEmbeddingId` is always `null` this sprint ("No embeddings. No
// vector database.") — a real, structurally-present-but-unused field,
// not a comment, so "Support future vector memory" is representable in
// the type itself: a future real embedding step fills this in without
// the shape changing.
export type MemoryRecord = {
  id: string
  learnerId: string
  category: MemoryCategory
  priority: MemoryPriority
  retention: MemoryRetention
  summary: string
  data: Record<string, unknown>
  createdAt: string
  expiresAt: string | null
  vectorEmbeddingId: string | null
}
