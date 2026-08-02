import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { LearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import type { LearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import type { UniversalLearningObject } from './types/UniversalLearningObject'
import type { ULOAuditEntry } from './types/ULOAudit'
import { computeULOParts } from './internal/computeULOParts'

export type ULOUpdateOptions = {
  now?: () => Date
  changeSummary?: string
}

const DEFAULT_CHANGE_SUMMARY = 'Re-aggregated via UCE-6 Universal Learning Object update.'

// Universal Learning Object™ (UCE-6). Real version/audit-trail update —
// "Every update creates a new version... Support: Version history,
// Audit trail." Simpler than UCE-4/UCE-5's incremental update: UCE-6
// makes zero AI calls, so there is no expensive AI-derived data to
// selectively reuse — every field is cheap to fully recompute (via the
// same internal/computeULOParts.ts buildUniversalLearningObject.ts
// uses), so "update" here means real version/audit discipline, not
// selective recomputation. `id`/`createdAt` are preserved; `version.
// revision` increments; one real `ULOAuditEntry` is appended.
export function updateUniversalLearningObject(
  existingULO: UniversalLearningObject,
  document: UniversalLearningDocument,
  chunks: readonly LearningChunk[],
  graph: LearningKnowledgeGraph,
  analysis: LearningAnalysis,
  options: ULOUpdateOptions = {},
): UniversalLearningObject {
  const now = options.now ?? (() => new Date())
  const nowIso = now().toISOString()

  const parts = computeULOParts(document, chunks, graph, analysis)

  const auditEntry: ULOAuditEntry = {
    changedAt: nowIso,
    changedBy: 'system',
    changeSummary: options.changeSummary ?? DEFAULT_CHANGE_SUMMARY,
  }

  return {
    id: existingULO.id,
    documentId: document.id,
    version: { ...existingULO.version, revision: existingULO.version.revision + 1 },
    knowledge: { document, chunks, graph, references: parts.references },
    analysis,
    learning: parts.learning,
    experience: parts.experience,
    audit: {
      ...existingULO.audit,
      lastModifiedAt: nowIso,
      lastModifiedBy: 'system',
      history: [...existingULO.audit.history, auditEntry],
    },
    createdAt: existingULO.createdAt,
    lastModifiedAt: nowIso,
  }
}
