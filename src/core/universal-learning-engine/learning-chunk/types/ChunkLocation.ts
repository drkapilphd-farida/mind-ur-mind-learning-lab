// Learning Chunk™ (canonical domain model). A chunk's real position
// within its source document — "maintain reading order," satisfied
// without needing the full document alongside every chunk. Every field
// is real, derived directly from the chunk's own UCE-3A ReadingChunk
// (`order`/`sectionId`/`heading`) plus its sibling ChunkedLearningDocument
// (`totalChunksInDocument`).
export type ChunkLocation = {
  order: number
  sectionId: string
  sectionHeading: string | null
  totalChunksInDocument: number
}
