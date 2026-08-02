import { runWithConcurrency, withExecuteTimeout } from '@/core/ai-foundation'
import type { AIFoundation } from '@/core/ai-foundation'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { UniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import type { GraphBuildOptions } from './types/GraphBuildOptions'
import type { LearningKnowledgeGraph } from './types/LearningKnowledgeGraph'
import type { ChunkGraphNode, ConceptGraphNode, GraphNode } from './types/GraphNode'
import type { GraphEdge } from './types/GraphEdge'
import { buildConceptIndex, collectChunkConceptLabels } from './internal/buildConceptIndex'
import { buildStructuralEdges } from './internal/buildStructuralEdges'
import { buildBuildsUponPrompt } from './internal/buildBuildsUponPrompt'
import { parseBuildsUponResponse } from './internal/parseBuildsUponResponse'
import { normalizeConceptLabel } from './internal/normalizeConceptLabel'
import { computeEdgeId } from './internal/computeEdgeId'

// Production AI Integration — ALS-24. Matches Semantic Enrichment
// Engine™ (UCE-3B)'s own real-world-proven defaults exactly (concurrency
// 3, 30s per call) rather than inventing new numbers.
const DEFAULT_CONCURRENCY = 3
const DEFAULT_TIMEOUT_MS = 30_000

function buildChunkNode(chunk: LearningChunk): ChunkGraphNode {
  return {
    id: chunk.id,
    type: 'chunk',
    chunkId: chunk.id,
    documentId: chunk.source.documentId,
    // Real fallback for a chunk with no heading — a positional label,
    // never fabricated prose.
    label: chunk.location.sectionHeading ?? `Section ${chunk.location.order + 1}`,
    order: chunk.location.order,
  }
}

type PendingBuildsUponCall = {
  chunk: LearningChunk
  chunkConceptLabels: readonly string[]
  introducedLabelsSnapshot: readonly string[]
}

// One AIFoundation.execute('relationship-detection', ...) call per
// chunk (never per concept pair) — the one AI-derived edge type this
// sprint, `builds-upon`. A chunk's own concepts are only added to
// `introducedLabels` AFTER it's processed, so a chunk is never asked
// whether it builds upon its own concepts. A chunk whose AIFoundation
// call fails, or whose response contains no usable JSON, simply
// contributes zero builds-upon edges — never a thrown error, matching
// this whole arc's "genuine AI response, no usable structured data
// this time" discipline (see semantic-enrichment/internal/
// parseEnrichmentResponse.ts's identical precedent).
//
// `chunkIdsToProcess` (optional): when supplied, only chunks in this set
// actually get an AI call — every chunk is still walked in order to keep
// `introducedLabels`' context correct, but a chunk outside the set
// contributes no new edges from this call. Used by
// updateLearningKnowledgeGraph.ts to re-run AI only for genuinely
// changed chunks, reusing every other builds-upon edge from the
// existing graph — the real "Incremental updates" savings, since this
// is the one genuinely expensive part of graph construction.
//
// Production AI Integration — ALS-24. `collectChunkConceptLabels` reads
// only already-computed `chunk.enrichment` (UCE-3B runs before this
// function does) — so which concepts are "already introduced" by the
// time a given chunk is reached is fully knowable up front, in one cheap,
// synchronous, still-sequential pass (this is the part that must stay
// sequential — it's what "builds upon a PRIOR concept" actually means).
// The AI calls themselves have no such ordering dependency on each
// other's results, so they're dispatched with the same bounded
// concurrency + per-call timeout UCE-3B already uses — a document's real
// processing time no longer scales as badly with chunk count, and no
// single stuck call can hang the whole pipeline the way ALS-22 found and
// fixed for PDF extraction.
export async function buildBuildsUponEdges(chunks: readonly LearningChunk[], conceptIndex: ReadonlyMap<string, ConceptGraphNode>, aiFoundation: Pick<AIFoundation, 'execute'>, now: () => Date, chunkIdsToProcess?: ReadonlySet<string>): Promise<readonly GraphEdge[]> {
  const sortedChunks = [...chunks].sort((a, b) => a.location.order - b.location.order)
  const introducedLabels: string[] = []
  const pendingCalls: PendingBuildsUponCall[] = []

  for (const chunk of sortedChunks) {
    const chunkConceptLabels = collectChunkConceptLabels(chunk)
    const shouldProcess = chunkIdsToProcess === undefined || chunkIdsToProcess.has(chunk.id)

    if (shouldProcess && chunkConceptLabels.length > 0 && introducedLabels.length > 0) {
      pendingCalls.push({ chunk, chunkConceptLabels, introducedLabelsSnapshot: [...introducedLabels] })
    }

    for (const label of chunkConceptLabels) {
      if (!introducedLabels.some((introduced) => normalizeConceptLabel(introduced) === normalizeConceptLabel(label))) {
        introducedLabels.push(label)
      }
    }
  }

  const results = await runWithConcurrency(pendingCalls, DEFAULT_CONCURRENCY, (pending) => {
    const payload = buildBuildsUponPrompt(pending.chunk, pending.chunkConceptLabels, pending.introducedLabelsSnapshot)
    const requestId = `${pending.chunk.id}-builds-upon`
    return withExecuteTimeout(aiFoundation.execute('relationship-detection', payload, requestId), 'relationship-detection', DEFAULT_TIMEOUT_MS, requestId, now)
  })

  const edges = new Map<string, GraphEdge>()

  for (let index = 0; index < pendingCalls.length; index += 1) {
    const pending = pendingCalls[index]
    const result = results[index]
    if (!pending || !result || !result.success) continue

    const relationships = parseBuildsUponResponse(result.response.content, pending.chunkConceptLabels, pending.introducedLabelsSnapshot)
    for (const relationship of relationships) {
      const conceptId = conceptIndex.get(normalizeConceptLabel(relationship.concept))?.id
      const priorConceptId = conceptIndex.get(normalizeConceptLabel(relationship.buildsOnConcept))?.id
      if (!conceptId || !priorConceptId) continue

      const id = computeEdgeId('builds-upon', conceptId, priorConceptId, 'directed')
      const existing = edges.get(id)
      edges.set(id, {
        id,
        type: 'builds-upon',
        sourceNodeId: conceptId,
        targetNodeId: priorConceptId,
        direction: 'directed',
        weight: (existing?.weight ?? 0) + 1,
        confidence: Math.max(existing?.confidence ?? 0, relationship.confidence),
        computedBy: 'semantic',
        createdAt: existing?.createdAt ?? now().toISOString(),
      })
    }
  }

  return [...edges.values()]
}

// Learning Knowledge Graph™ (UCE-4). Builds a fresh graph from real
// LearningChunk/UniversalLearningDocument input — never modifies either.
// Deterministic structural edges are always computed; the one AI-derived
// edge type (`builds-upon`) only runs when `options.aiFoundation` is
// supplied, so this function is fast and free by default (required
// given "Future million-node scalability").
export async function buildLearningKnowledgeGraph(chunks: readonly LearningChunk[], document: UniversalLearningDocument, options: GraphBuildOptions = {}): Promise<LearningKnowledgeGraph> {
  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())

  const conceptIndex = buildConceptIndex(chunks)
  const nodes: GraphNode[] = [...chunks.map(buildChunkNode), ...conceptIndex.values()]

  const structuralEdges = buildStructuralEdges(chunks, conceptIndex, now)
  const buildsUponEdges = options.aiFoundation ? await buildBuildsUponEdges(chunks, conceptIndex, options.aiFoundation, now) : []
  const edges = [...structuralEdges, ...buildsUponEdges]

  const nowIso = now().toISOString()

  return {
    id: idFactory(),
    documentId: document.id,
    version: { schemaVersion: '1.0.0', revision: 1 },
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    createdAt: nowIso,
    lastModifiedAt: nowIso,
  }
}
