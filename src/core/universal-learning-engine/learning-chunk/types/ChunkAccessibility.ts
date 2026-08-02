// Learning Chunk™ (canonical domain model). Real, computed from the
// chunk's own real media list — `hasAltText` is true only when at least
// one real media item carries real alt text (never assumed).
export type ChunkAccessibility = {
  hasAltText: boolean
  imageCount: number
  requiresScreenReaderReview: boolean
}
