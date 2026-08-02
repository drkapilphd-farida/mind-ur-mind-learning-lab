import type { LearningContentBlock } from '@/core/universal-learning-engine/extraction'
import type { ChunkSource } from './ChunkIdentity'
import type { ChunkLocation } from './ChunkLocation'
import type { ChunkStatistics, ChunkReadingMetrics } from './ChunkStatistics'
import type { ChunkRelationship, ChunkHierarchy } from './ChunkRelationship'
import type { ChunkConfidence } from './ChunkConfidence'
import type { ChunkAudit } from './ChunkAudit'
import type { ChunkMedia, ChunkTable, ChunkFormula, ChunkCode, ChunkCitation } from './ChunkContent'
import type { ChunkLanguage } from './ChunkLanguage'
import type { ChunkAccessibility } from './ChunkAccessibility'
import type { ChunkTags } from './ChunkTags'
import type { ChunkEnrichment } from './ChunkEnrichment'
import type { ChunkExtensions } from './ChunkExtensions'

// Learning Chunk™ (canonical domain model). Every chunk built this sprint
// is 'structural' — UCE-3B (Semantic Enrichment Engine) is the one real
// transition made so far, to 'semantically-enriched'. `'graph-linked'`
// was originally reserved for UCE-4 (Learning Knowledge Graph Engine) to
// set — corrected: UCE-4's own brief explicitly forbids modifying chunks
// at all ("Never modify: Original document, Original chunks, Semantic
// enrichment... The graph is an additional intelligence layer"), so no
// chunk ever actually transitions to `'graph-linked'`; the value stays
// in this union only as a documented, deliberately unused historical
// artifact, kept rather than removed since it's not this sprint's call
// to make a breaking change to a locked union. `'ai-analyzed'` remains
// reserved for UCE-5. Downstream consumers can branch on this field
// without needing to know which enrichment fields are populated.
export type ChunkStatus = 'structural' | 'semantically-enriched' | 'graph-linked' | 'ai-analyzed'

// Real versioning envelope — the migration hook. `schemaVersion` is the
// shape version of LearningChunk itself ("1.0.0" this sprint, bumped only
// on a breaking shape change); `revision` is this specific chunk's real
// edit count, starting at 1 at build time and incremented only by a real
// future update (never today, since nothing revises a chunk yet).
export type ChunkVersion = {
  schemaVersion: string
  revision: number
}

// Lightweight, real display metadata — distinct from ChunkSource
// (relational ids for traceability) and ChunkLocation (structural
// position/order). Lets a consumer render a chunk (e.g. a Learning Mode
// UI) without joining back to the full UniversalLearningDocument. `title`
// reuses the chunk's own real heading verbatim (same value as
// ChunkLocation.sectionHeading — not re-derived); `documentTitle` reuses
// the parent document's real title verbatim. `contentType` is real,
// derived from whether the chunk's own blocks include a table/image.
export type ChunkMetadata = {
  title: string | null
  documentTitle: string
  contentType: 'text' | 'mixed'
}

// Learning Chunk™ — the canonical, single-source-of-truth object every
// downstream engine (UCE-3B onward) and every Learning Mode consumes.
// UniversalLearningDocument (UCE-2) stays internal; nothing outside this
// engine ever sees a raw PDF/DOCX/OCR/paragraph again. Every field here
// is either a real value derivable today from UCE-1/UCE-2/UCE-3A's actual
// output, or an explicitly typed, honestly absent/empty placeholder for a
// named future engine — see each field's own type file for which.
export type LearningChunk = {
  id: string
  version: ChunkVersion
  status: ChunkStatus
  metadata: ChunkMetadata
  content: string
  blocks: readonly LearningContentBlock[]
  source: ChunkSource
  location: ChunkLocation
  statistics: ChunkStatistics
  readingMetrics: ChunkReadingMetrics
  hierarchy: ChunkHierarchy
  relationships: readonly ChunkRelationship[]
  confidence: ChunkConfidence
  media: readonly ChunkMedia[]
  tables: readonly ChunkTable[]
  formulas: readonly ChunkFormula[]
  code: readonly ChunkCode[]
  citations: readonly ChunkCitation[]
  language: ChunkLanguage
  accessibility: ChunkAccessibility
  tags: ChunkTags
  audit: ChunkAudit
  enrichment: ChunkEnrichment
  extensions: ChunkExtensions
}
