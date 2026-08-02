import type { AdaptiveRuntimeState } from '@/core/adaptive-learning-runtime'
import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import type { ModeChunkView } from '../types/ModeChunkView'

// Shared Learning Runtime — Memory Mode™ Sprint-1 shared-extraction.
// Moved verbatim from Quantum Speed Reading™'s own
// `orchestration/resolveCurrentChunkView.ts` (Sprint-1/2) — already fully
// mode-agnostic; only the return type's name changed
// (`ReadingChunkView` → `ModeChunkView`).
export function resolveCurrentChunkView(runtime: AdaptiveRuntimeState, ulo: UniversalLearningObject): ModeChunkView | null {
  const chunkNodeId = runtime.position.chunkNodeId
  if (chunkNodeId === null) return null

  const queueItem = runtime.scheduledQueue.items[runtime.position.queueIndex]
  const chunk = ulo.knowledge.chunks.find((candidate) => candidate.id === chunkNodeId)
  if (!queueItem || !chunk || queueItem.chunkNodeId !== chunkNodeId) return null

  return {
    chunkNodeId,
    order: chunk.location.order,
    content: chunk.content,
    title: chunk.metadata.title,
    sectionHeading: chunk.location.sectionHeading,
    isCheckpoint: queueItem.isCheckpoint,
    ...(queueItem.checkpointLabel !== undefined ? { checkpointLabel: queueItem.checkpointLabel } : {}),
    ...(Object.keys(chunk.enrichment).length > 0 ? { enrichment: chunk.enrichment } : {}),
  }
}
