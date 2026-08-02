import type { LearningContentBlock, UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { ChunkedLearningDocument, ReadingChunk } from '@/core/universal-learning-engine/chunking'
import type { LearningChunk } from '../types/LearningChunk'
import type { ChunkMedia, ChunkTable } from '../types/ChunkContent'
import type { ChunkRelationship } from '../types/ChunkRelationship'
import { blocksToContent } from '../internal/blockText'
import { createEmptyChunkEnrichment } from '../factories/createEmptyChunkEnrichment'

// Same reading-speed assumption already established in this arc
// (extraction/services/computeReadability.ts, src/lib/reading/
// generateReadingPassage.ts) — both keep it as a local, unexported
// constant rather than a shared import, so this file follows that same
// established convention rather than introducing a new shared constant.
const AVERAGE_READING_WPM = 200

export type BuildLearningChunkOptions = {
  now?: () => Date
}

function buildMedia(chunkId: string, blocks: readonly LearningContentBlock[]): readonly ChunkMedia[] {
  return blocks
    .filter((block): block is Extract<LearningContentBlock, { type: 'image' }> => block.type === 'image')
    .map((block, index) => ({
      id: `${chunkId}-media-${index}`,
      contentType: block.contentType,
      alt: block.alt,
    }))
}

function buildTables(chunkId: string, blocks: readonly LearningContentBlock[]): readonly ChunkTable[] {
  return blocks
    .filter((block): block is Extract<LearningContentBlock, { type: 'table' }> => block.type === 'table')
    .map((block, index) => ({
      id: `${chunkId}-table-${index}`,
      rows: block.rows,
    }))
}

// Pure, order-adjacency-only relationship computation — a 100%
// deterministic structural fact (zero inference), not a semantic
// judgment. See ChunkRelationship.ts's own comment for why this is the
// one disclosed exception to "do not compute relationships" this sprint.
function buildRelationships(readingChunk: ReadingChunk, chunkedDocument: ChunkedLearningDocument): readonly ChunkRelationship[] {
  const index = chunkedDocument.chunks.findIndex((chunk) => chunk.id === readingChunk.id)
  const previous = index > 0 ? chunkedDocument.chunks[index - 1] : undefined
  const next = index >= 0 && index < chunkedDocument.chunks.length - 1 ? chunkedDocument.chunks[index + 1] : undefined

  const relationships: ChunkRelationship[] = []
  if (previous) {
    relationships.push({ type: 'previous', targetChunkId: previous.id, confidence: 1, computedBy: 'structural' })
  }
  if (next) {
    relationships.push({ type: 'next', targetChunkId: next.id, confidence: 1, computedBy: 'structural' })
  }
  return relationships
}

// Universal Learning Intelligence Engine™ (ULIE™) — Learning Chunk™
// Architecture Sprint. Pure mapping from UCE-3A's real ReadingChunk (plus
// its sibling ChunkedLearningDocument, for real order-adjacency, and its
// source UniversalLearningDocument, for real traceability/title data)
// into the canonical LearningChunk shape. Every field is either a real
// value derived from data these three engines already produced, or an
// explicitly empty/null placeholder for a named future engine — see the
// individual type files under ../types for which. `options.now` is the
// only DI seam: `id` is reused verbatim from `readingChunk.id` (never
// generated here), so no `idFactory` is needed, matching UCE-1/UCE-2's
// established injectable-clock pattern.
export function buildLearningChunk(
  readingChunk: ReadingChunk,
  chunkedDocument: ChunkedLearningDocument,
  document: UniversalLearningDocument,
  options: BuildLearningChunkOptions = {},
): LearningChunk {
  const now = options.now ?? (() => new Date())
  const nowIso = now().toISOString()

  const content = blocksToContent(readingChunk.blocks)
  const media = buildMedia(readingChunk.id, readingChunk.blocks)
  const tables = buildTables(readingChunk.id, readingChunk.blocks)
  const paragraphCount = readingChunk.blocks.filter((block) => block.type === 'paragraph').length
  const estimatedReadingSeconds = readingChunk.wordCount > 0 ? Math.max(1, Math.round((readingChunk.wordCount / AVERAGE_READING_WPM) * 60)) : 0
  const hasAltText = media.some((item) => item.alt !== null)
  const requiresScreenReaderReview = media.some((item) => item.alt === null)

  return {
    id: readingChunk.id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    status: 'structural',
    metadata: {
      title: readingChunk.heading,
      documentTitle: document.title,
      contentType: readingChunk.hasTable || readingChunk.hasImage ? 'mixed' : 'text',
    },
    content,
    blocks: readingChunk.blocks,
    source: {
      documentId: readingChunk.documentId,
      universalSourceId: document.source.id,
      sectionId: readingChunk.sectionId,
      originalSourceType: document.source.sourceType,
    },
    location: {
      order: readingChunk.order,
      sectionId: readingChunk.sectionId,
      sectionHeading: readingChunk.heading,
      totalChunksInDocument: chunkedDocument.chunkCount,
    },
    statistics: {
      wordCount: readingChunk.wordCount,
      characterCount: content.length,
      blockCount: readingChunk.blocks.length,
      paragraphCount,
      tableCount: tables.length,
      mediaCount: media.length,
    },
    readingMetrics: { estimatedReadingSeconds },
    hierarchy: { depth: 0, path: [readingChunk.id], parentChunkId: null },
    relationships: buildRelationships(readingChunk, chunkedDocument),
    confidence: { structural: 1, semantic: null, overall: null },
    media,
    tables,
    formulas: [],
    code: [],
    citations: [],
    language: { code: document.language, confidence: null },
    accessibility: { hasAltText, imageCount: media.length, requiresScreenReaderReview },
    tags: { userTags: [], systemTags: [] },
    audit: { createdAt: nowIso, createdBy: 'system', lastModifiedAt: nowIso, lastModifiedBy: 'system', history: [] },
    enrichment: createEmptyChunkEnrichment(),
    extensions: {},
  }
}

// Batch convenience wrapper — builds every LearningChunk in a document in
// one call, sharing one `now()` timestamp across the batch (matching
// buildChunkedLearningDocument's own single-assembly-point pattern in
// UCE-3A, so chunkCount/totalWordCount aren't the only thing computed in
// exactly one place — the whole document's chunk set is too).
export function buildLearningChunks(
  chunkedDocument: ChunkedLearningDocument,
  document: UniversalLearningDocument,
  options: BuildLearningChunkOptions = {},
): readonly LearningChunk[] {
  const now = options.now ?? (() => new Date())
  const nowIso = now().toISOString()
  return chunkedDocument.chunks.map((readingChunk) => buildLearningChunk(readingChunk, chunkedDocument, document, { now: () => new Date(nowIso) }))
}
