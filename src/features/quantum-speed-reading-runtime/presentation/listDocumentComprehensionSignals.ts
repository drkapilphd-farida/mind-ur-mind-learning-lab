import type { UniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'

// Quantum Speed Reading Experience Engine™ (QSR-E1) — Comprehension
// Check™. Mirrors `mcqs-mode-runtime/presentation/listDocumentDefinitions.ts`
// exactly, for the same reason: pooling every chunk's own real,
// already-AI-extracted (UCE-3B) enrichment fields — never a second parse,
// never a new Claude call — so a comprehension question about the
// *current* chunk can draw real, honest distractors from elsewhere in the
// same real document. Every one of these fields is a genuinely prompted,
// genuinely populated UCE-3B output (confirmed against
// `buildEnrichmentPrompt.ts`'s own real system instruction) — unlike
// `ChunkFormula`/`ChunkCode`, which are real types but always `[]` in
// practice today (no engine populates them yet), so "formula recognition"
// is deliberately not one of these signal kinds — building it now would
// be dead code against a field nothing ever fills in.
export type DocumentComprehensionSignal = {
  chunkNodeId: string
  kind: 'main-idea' | 'concept' | 'entity' | 'misconception'
  value: string
}

export function listDocumentComprehensionSignals(ulo: UniversalLearningObject): readonly DocumentComprehensionSignal[] {
  const signals: DocumentComprehensionSignal[] = []

  for (const chunk of [...ulo.knowledge.chunks].sort((a, b) => a.location.order - b.location.order)) {
    const enrichment = chunk.enrichment
    if (enrichment.semantic) signals.push({ chunkNodeId: chunk.id, kind: 'main-idea', value: enrichment.semantic })
    for (const concept of [...(enrichment.concepts ?? []), ...(enrichment.importantTerms ?? [])]) {
      signals.push({ chunkNodeId: chunk.id, kind: 'concept', value: concept })
    }
    for (const entity of enrichment.entities ?? []) {
      signals.push({ chunkNodeId: chunk.id, kind: 'entity', value: entity })
    }
    for (const misconception of enrichment.misconceptions ?? []) {
      signals.push({ chunkNodeId: chunk.id, kind: 'misconception', value: misconception })
    }
  }

  return signals
}
