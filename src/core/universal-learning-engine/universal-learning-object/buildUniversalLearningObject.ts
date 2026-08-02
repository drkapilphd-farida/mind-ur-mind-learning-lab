import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { UniversalLearningObject } from './types/UniversalLearningObject'
import { computeULOParts } from './internal/computeULOParts'

export type ULOBuildOptions = {
  now?: () => Date
  idFactory?: () => string
}

// Universal Learning Object™ (UCE-6). Aggregates real
// `UniversalLearningDocument`/`LearningChunk[]`/`LearningKnowledgeGraph`/
// `LearningAnalysis` input into one immutable ULO — never modifies any
// of them, never calls `AIFoundation` (UCE-6 makes zero AI calls; see
// docs/PRODUCTION_HANDOFF_UCE_6.md). Every field is either the real
// upstream object embedded by composition, or a real, disclosed,
// deterministic re-shape computed by internal/computeULOParts.ts (the
// one shared implementation this function and
// updateUniversalLearningObject.ts both call) — never new AI-derived
// content.
export function buildUniversalLearningObject(
  document: UniversalLearningDocument,
  chunks: readonly LearningChunk[],
  graph: LearningKnowledgeGraph,
  analysis: LearningAnalysis,
  options: ULOBuildOptions = {},
): UniversalLearningObject {
  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())

  const parts = computeULOParts(document, chunks, graph, analysis)
  const nowIso = now().toISOString()

  return {
    id: idFactory(),
    documentId: document.id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    knowledge: { document, chunks, graph, references: parts.references },
    analysis,
    learning: parts.learning,
    experience: parts.experience,
    audit: { createdAt: nowIso, createdBy: 'system', lastModifiedAt: nowIso, lastModifiedBy: 'system', history: [] },
    createdAt: nowIso,
    lastModifiedAt: nowIso,
  }
}
