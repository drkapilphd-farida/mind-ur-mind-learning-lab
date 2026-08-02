import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { enrichLearningChunks } from '@/core/universal-learning-engine/semantic-enrichment'
import { updateLearningKnowledgeGraph } from '@/core/universal-learning-engine/knowledge-graph'
import { updateLearningAnalysis } from '@/core/universal-learning-engine/learning-analysis'
import { updateUniversalLearningObject } from '@/core/universal-learning-engine/universal-learning-object'
import { buildChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import { buildLearningAssets } from '@/core/universal-learning-engine/learning-assets'
import { saveUniversalLearningObject, loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { loadDocumentChunkCache, saveDocumentChunkCacheEntries } from '@/features/learning-mode-runtime/persistence/documentChunkCache'
import {
  loadChapterIntelligenceBlueprints,
  saveChapterIntelligenceBlueprint,
  type ChapterIntelligenceBlueprintCacheEntry,
} from '@/features/learning-mode-runtime/persistence/chapterIntelligenceBlueprints'
import { loadLearningAssetBundles, saveLearningAssetBundle } from '@/features/learning-mode-runtime/persistence/learningAssetBundles'
import {
  loadDocumentProcessingProgress,
  claimDocumentProcessingProgressLock,
  advanceDocumentProcessingProgress,
  type DocumentProcessingProgress,
} from '@/features/learning-mode-runtime/persistence/documentProcessingProgress'
import { saveDocumentProcessingSummary } from '@/features/learning-mode-runtime/persistence/documentProcessingSummary'
import { createServiceClient } from '@/lib/supabase/service'
import { createAIFoundation } from '@/core/ai-foundation'
import { createSupabaseCostTracker } from '@/core/ai-foundation/costTracking/createSupabaseCostTracker'
import { hashChunkContent } from '@/lib/hashChunkContent'
import { markDocumentReady } from '@/services/documents'
import { logger } from '@/lib/logger'
import { diagnoseSupabaseError } from '@/lib/processing/diagnoseSupabaseError'
import { validateProcessingState } from '@/lib/processing/validateProcessingState'
import type { Document } from '@/types/documents'

// One real batch of chunks enriched per call — small enough that even a
// slow AI call comfortably fits inside one HTTP request/response cycle
// (matches `enrichLearningChunks`'s own existing concurrency default, so
// worst case is one 30s timeout, not several sequential ones).
const ENRICHMENT_BATCH_SIZE = 3
// Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1 — raised from
// 45s to 90s (Objective 3). A single enrichment batch's own real Claude
// call can legitimately take up to its own 30s timeout
// (withExecuteTimeout inside enrichLearningChunks); 45s left too little
// real margin between "genuinely still running" and "safe to reclaim,"
// risking two pollers racing on the same still-live batch. 90s stays
// short enough to recover quickly from a genuinely abandoned/crashed
// call while comfortably clearing one real batch's worst case.
const LOCK_STALE_AFTER_MS = 90_000

export type AdvanceBackgroundProcessingResult =
  | { outcome: 'advanced'; progress: DocumentProcessingProgress }
  | { outcome: 'complete'; progress: DocumentProcessingProgress }
  | { outcome: 'skipped-locked' }
  | { outcome: 'no-progress' }
  | { outcome: 'failed'; error: string }

// ALS-15 Instant Learning Engine™ — Phase 3 "Background AI Intelligence."
// Does exactly ONE bounded unit of work per call, driven by the real
// progress row's `stage`: enrich the next batch of un-enriched chunks, OR
// build the knowledge graph, OR build the learning analysis, OR mark
// complete. Every real Claude call this function makes is one that used
// to happen inside the old single blocking pipeline — total real spend
// per document is unchanged, only spread across many small calls instead
// of one long one.
export async function advanceBackgroundProcessing(document: Document): Promise<AdvanceBackgroundProcessingResult> {
  const serviceClient = createServiceClient()

  const progress = await loadDocumentProcessingProgress(serviceClient, document.id)
  if (!progress || progress.stage === 'complete' || progress.stage === 'failed') {
    return { outcome: 'no-progress' }
  }

  // Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1 (Objective
  // 4) — real corruption detection before doing any work from this row's
  // premise. Every issue found is logged for visibility ("detect,"
  // per the brief); only 'zero-total-chunks' is treated as blocking,
  // since it's the one issue that would otherwise silently make
  // enrichment report itself "done" with zero real chunks processed —
  // every other issue is a real inconsistency worth knowing about but
  // not, on its own, something that causes this function to compute a
  // wrong result on this tick, so processing is allowed to continue and
  // self-correct rather than stranding the document a second way.
  const stateIssues = validateProcessingState(progress)
  if (stateIssues.length > 0) {
    logger.warn('[BackgroundIntelligence] processing state issue(s) detected', { documentId: document.id, stage: progress.stage, issues: stateIssues })
    if (stateIssues.some((issue) => issue.code === 'zero-total-chunks')) {
      await advanceDocumentProcessingProgress(serviceClient, document.id, { stage: 'failed', errorMessage: 'This document has no real content to process.' })
      return { outcome: 'failed', error: 'This document has no real content to process.' }
    }
  }

  const claimed = await claimDocumentProcessingProgressLock(serviceClient, document.id, LOCK_STALE_AFTER_MS)
  if (!claimed) {
    return { outcome: 'skipped-locked' }
  }

  const startedAt = Date.now()
  const stage = progress.stage
  logger.info(`[BackgroundIntelligence] ${stage} — START`, { documentId: document.id })

  // ALS-15.1 Production Debug Sprint™ — "Never swallow exceptions." Every
  // one of this function's own real early-return failure guards below
  // (`!saved`/`!updated`) used to return a generic error with no log line
  // at all — a real write failure at any of these points was completely
  // invisible in server logs. This one helper is now called at each of
  // them, so every real failure this function can report is also logged
  // with a real, diagnosed reason.
  function logGuardFailure(reason: string): void {
    logger.error(`[BackgroundIntelligence] ${stage} — FAIL`, { documentId: document.id, elapsedMs: Date.now() - startedAt, reason })
  }

  function logSuccess(extra?: Record<string, unknown>): void {
    logger.info(`[BackgroundIntelligence] ${stage} — SUCCESS`, { documentId: document.id, elapsedMs: Date.now() - startedAt, ...extra })
  }

  try {
    const ulo = await loadUniversalLearningObject(serviceClient, document.id)
    if (!ulo) {
      logGuardFailure('Universal Learning Object not found — cannot continue background processing.')
      await advanceDocumentProcessingProgress(serviceClient, document.id, { stage: 'failed', errorMessage: 'The document could not be found for background processing.' })
      return { outcome: 'failed', error: 'We could not finish preparing this document.' }
    }

    const costTracker = createSupabaseCostTracker(serviceClient, document.id)
    const aiFoundation = createAIFoundation({ costTracker })

    if (progress.stage === 'enriching_chunks') {
      const unenriched = ulo.knowledge.chunks.filter((chunk) => chunk.status !== 'semantically-enriched').sort((a, b) => a.location.order - b.location.order)

      if (unenriched.length === 0) {
        const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, { stage: 'building_knowledge_graph' })
        if (!updated) {
          logGuardFailure('advanceDocumentProcessingProgress returned false while advancing to building_knowledge_graph.')
          return { outcome: 'failed', error: 'We could not save background processing progress.' }
        }
        logSuccess({ allChunksAlreadyEnriched: true })
        const next = await loadDocumentProcessingProgress(serviceClient, document.id)
        return next ? { outcome: 'advanced', progress: next } : { outcome: 'no-progress' }
      }

      const batch = unenriched.slice(0, ENRICHMENT_BATCH_SIZE)
      const cached = await loadDocumentChunkCache(serviceClient, document.id)
      const chunksForBatch: LearningChunk[] = batch.map((chunk) => {
        const contentHash = hashChunkContent(chunk.content)
        const cachedEntry = cached.get(chunk.location.order)
        return cachedEntry && cachedEntry.contentHash === contentHash ? cachedEntry.chunk : chunk
      })

      const enrichment = await enrichLearningChunks(chunksForBatch, ulo.knowledge.document, aiFoundation)
      const chunkById = new Map(chunksForBatch.map((chunk) => [chunk.id, chunk]))
      const enrichedBatch: LearningChunk[] = enrichment.outcomes.map((outcome) => (outcome.status === 'failed' ? (chunkById.get(outcome.chunkId) as LearningChunk) : outcome.chunk))

      const chunkOrderById = new Map(chunksForBatch.map((chunk) => [chunk.id, chunk.location.order]))
      const cacheableEntries = enrichment.outcomes
        .filter((outcome): outcome is Extract<typeof outcome, { status: 'enriched' | 'skipped' }> => outcome.status === 'enriched' || outcome.status === 'skipped')
        .map((outcome) => ({
          chunkOrder: chunkOrderById.get(outcome.chunkId) as number,
          contentHash: hashChunkContent(outcome.chunk.content),
          chunk: outcome.chunk,
        }))
      await saveDocumentChunkCacheEntries(serviceClient, document.id, cacheableEntries)

      const enrichedById = new Map(enrichedBatch.map((chunk) => [chunk.id, chunk]))
      const mergedChunks = ulo.knowledge.chunks.map((chunk) => enrichedById.get(chunk.id) ?? chunk)

      const updatedUlo = updateUniversalLearningObject(ulo, ulo.knowledge.document, mergedChunks, ulo.knowledge.graph, ulo.analysis, {
        changeSummary: `Background Intelligence: enriched ${enrichedBatch.length} chunk(s).`,
      })
      const saved = await saveUniversalLearningObject(serviceClient, updatedUlo)
      if (!saved) {
        logGuardFailure('saveUniversalLearningObject returned false while saving newly-enriched chunks.')
        return { outcome: 'failed', error: 'We could not save your document. Please try again.' }
      }

      const chunksEnriched = Math.min(progress.totalChunks, progress.chunksEnriched + enrichedBatch.length)
      const isEnrichmentDone = chunksEnriched >= progress.totalChunks
      const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, {
        chunksEnriched,
        stage: isEnrichmentDone ? 'building_knowledge_graph' : 'enriching_chunks',
      })
      if (!updated) {
        logGuardFailure('advanceDocumentProcessingProgress returned false while recording enrichment progress.')
        return { outcome: 'failed', error: 'We could not save background processing progress.' }
      }
      logSuccess({ chunksEnriched, totalChunks: progress.totalChunks, batchSize: enrichedBatch.length })

      const next = await loadDocumentProcessingProgress(serviceClient, document.id)
      return next ? { outcome: 'advanced', progress: next } : { outcome: 'no-progress' }
    }

    if (progress.stage === 'building_knowledge_graph') {
      const allChunkIds = ulo.knowledge.chunks.map((chunk) => chunk.id)
      const graph = await updateLearningKnowledgeGraph(ulo.knowledge.graph, ulo.knowledge.chunks, allChunkIds, ulo.knowledge.document, { aiFoundation })
      const updatedUlo = updateUniversalLearningObject(ulo, ulo.knowledge.document, ulo.knowledge.chunks, graph, ulo.analysis, {
        changeSummary: 'Background Intelligence: mapped concept relationships.',
      })
      const saved = await saveUniversalLearningObject(serviceClient, updatedUlo)
      if (!saved) {
        logGuardFailure('saveUniversalLearningObject returned false while saving the updated knowledge graph.')
        return { outcome: 'failed', error: 'We could not save your document. Please try again.' }
      }

      const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, { knowledgeGraphDone: true, stage: 'building_learning_analysis' })
      if (!updated) {
        logGuardFailure('advanceDocumentProcessingProgress returned false while advancing to building_learning_analysis.')
        return { outcome: 'failed', error: 'We could not save background processing progress.' }
      }
      logSuccess({ nodeCount: graph.nodeCount, edgeCount: graph.edgeCount })

      const next = await loadDocumentProcessingProgress(serviceClient, document.id)
      return next ? { outcome: 'advanced', progress: next } : { outcome: 'no-progress' }
    }

    if (progress.stage === 'building_learning_analysis') {
      const coreConceptNodeIds = ulo.knowledge.graph.nodes.filter((node) => node.type === 'concept').map((node) => node.id)
      const analysis = await updateLearningAnalysis(ulo.analysis, ulo.knowledge.chunks, ulo.knowledge.graph, coreConceptNodeIds, ulo.knowledge.document, { aiFoundation })
      const updatedUlo = updateUniversalLearningObject(ulo, ulo.knowledge.document, ulo.knowledge.chunks, ulo.knowledge.graph, analysis, {
        changeSummary: 'Background Intelligence: analyzed difficulty and learning path.',
      })
      const saved = await saveUniversalLearningObject(serviceClient, updatedUlo)
      if (!saved) {
        logGuardFailure('saveUniversalLearningObject returned false while saving the final learning analysis.')
        return { outcome: 'failed', error: 'We could not save your document. Please try again.' }
      }

      // Reading Intelligence Engine™ Upgrade — Sprint-1: transitions to
      // 'generating_blueprints' instead of 'complete' — the Learning
      // Blueprint Generator™ is the new final stage.
      const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, { learningAnalysisDone: true, stage: 'generating_blueprints' })
      if (!updated) {
        logGuardFailure('advanceDocumentProcessingProgress returned false while advancing to generating_blueprints.')
        return { outcome: 'failed', error: 'We could not save background processing progress.' }
      }
      logSuccess()

      const next = await loadDocumentProcessingProgress(serviceClient, document.id)
      return next ? { outcome: 'advanced', progress: next } : { outcome: 'no-progress' }
    }

    if (progress.stage === 'generating_blueprints') {
      // Reading Intelligence Engine™ Upgrade, Sprint-1: one Learning
      // Blueprint per chapter (= chunk), generated once and cached — an
      // unchanged chunk's real content_hash means its Blueprint is never
      // regenerated.
      const cachedBlueprints = await loadChapterIntelligenceBlueprints(serviceClient, document.id)
      const chunksNeedingBlueprints = ulo.knowledge.chunks
        .slice()
        .sort((a, b) => a.location.order - b.location.order)
        .filter((chunk) => {
          const cached = cachedBlueprints.get(chunk.location.order)
          return !cached || cached.contentHash !== hashChunkContent(chunk.content)
        })

      if (chunksNeedingBlueprints.length === 0) {
        // Reading Intelligence Engine™ Upgrade, Sprint-2: transitions to
        // 'generating_learning_assets' instead of 'complete' — the
        // Learning Assets Generator™ is the new final stage.
        const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, { stage: 'generating_learning_assets' })
        if (!updated) {
          logGuardFailure('advanceDocumentProcessingProgress returned false while advancing to generating_learning_assets.')
          return { outcome: 'failed', error: 'We could not save background processing progress.' }
        }
        logSuccess({ allBlueprintsAlreadyGenerated: true })
        const next = await loadDocumentProcessingProgress(serviceClient, document.id)
        return next ? { outcome: 'advanced', progress: next } : { outcome: 'no-progress' }
      }

      const chunk = chunksNeedingBlueprints[0] as LearningChunk
      const blueprint = await buildChapterIntelligenceBlueprint(chunk, ulo.knowledge.chunks, ulo.knowledge.document, ulo.knowledge.graph, ulo.analysis, { aiFoundation })
      const savedBlueprint = await saveChapterIntelligenceBlueprint(serviceClient, document.id, { chapterOrder: chunk.location.order, contentHash: hashChunkContent(chunk.content), blueprint })
      if (!savedBlueprint) {
        logGuardFailure('saveChapterIntelligenceBlueprint returned false while saving a chapter Blueprint.')
        return { outcome: 'failed', error: 'We could not save your document. Please try again.' }
      }

      const blueprintsGenerated = Math.min(progress.totalChapters, progress.blueprintsGenerated + 1)
      const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, { blueprintsGenerated, stage: 'generating_blueprints' })
      if (!updated) {
        logGuardFailure('advanceDocumentProcessingProgress returned false while recording Blueprint generation progress.')
        return { outcome: 'failed', error: 'We could not save background processing progress.' }
      }
      logSuccess({ blueprintsGenerated, totalChapters: progress.totalChapters, chapterOrder: chunk.location.order })

      const next = await loadDocumentProcessingProgress(serviceClient, document.id)
      return next ? { outcome: 'advanced', progress: next } : { outcome: 'no-progress' }
    }

    // 'generating_learning_assets' — the final stage. Reading
    // Intelligence Engine™ Upgrade, Sprint-2: one Learning Asset Bundle
    // per chapter, derived purely from that chapter's own already-real,
    // already-stored Blueprint — zero new AI, zero re-reading of raw
    // chunks/graph/analysis. Gated on the SAME content_hash already
    // stored on the source Blueprint row, so an unregenerated Blueprint
    // never regenerates its assets either.
    const [cachedBlueprintsForAssets, cachedAssetBundles] = await Promise.all([loadChapterIntelligenceBlueprints(serviceClient, document.id), loadLearningAssetBundles(serviceClient, document.id)])
    const chaptersNeedingAssets: Array<[number, ChapterIntelligenceBlueprintCacheEntry]> = [...cachedBlueprintsForAssets.entries()]
      .sort(([a], [b]) => a - b)
      .filter(([chapterOrder, blueprintEntry]) => {
        const cached = cachedAssetBundles.get(chapterOrder)
        return !cached || cached.contentHash !== blueprintEntry.contentHash
      })

    // Reading Intelligence Engine™ Upgrade — Sprint PIPELINE-1 (Objective
    // 5) — "nothing left to update" is not the same claim as "real
    // output actually exists." An empty chaptersNeedingAssets is also
    // true, vacuously, when NO Blueprints exist at all (cachedBlueprintsForAssets.size
    // === 0) — a real gap that would otherwise mark a document ready
    // with zero real Blueprints and zero real Learning Asset Bundles.
    // Requiring at least one real Blueprint closes it without changing
    // the Blueprint/Learning-Assets generation logic itself.
    if (chaptersNeedingAssets.length === 0 && cachedBlueprintsForAssets.size > 0) {
      const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, { stage: 'complete' })
      if (!updated) {
        logGuardFailure('advanceDocumentProcessingProgress returned false while marking Background Intelligence complete.')
        return { outcome: 'failed', error: 'We could not save background processing progress.' }
      }

      await markDocumentReady(document.userId, document.id)

      const costEntries = costTracker.list()
      await saveDocumentProcessingSummary(serviceClient, document.id, {
        totalChunks: progress.totalChunks,
        processedChunks: progress.chunksEnriched,
        reusedChunks: 0,
        claudeCalls: costEntries.filter((entry) => entry.success).length,
        skippedCalls: 0,
        inputTokens: costEntries.reduce((sum, entry) => sum + entry.tokens.inputTokens, 0),
        outputTokens: costEntries.reduce((sum, entry) => sum + entry.tokens.outputTokens, 0),
        estimatedCostCents: costEntries.reduce((sum, entry) => sum + entry.actualCost.totalCostCents, 0),
        processingTimeMs: costEntries.reduce((sum, entry) => sum + entry.processingTimeMs, 0),
      })
      logSuccess({ documentNowReady: true })

      const next = await loadDocumentProcessingProgress(serviceClient, document.id)
      return next ? { outcome: 'complete', progress: next } : { outcome: 'no-progress' }
    }

    // Real, explicit failure for the one state the "at least one real
    // Blueprint" guard above deliberately falls through to: this stage
    // reached with zero real Blueprint rows at all — should not happen
    // given the pipeline's own sequencing, but a clean, diagnosable
    // error is strictly better than an implicit crash on the next line.
    if (chaptersNeedingAssets.length === 0) {
      logGuardFailure('reached generating_learning_assets with zero real Blueprint rows — nothing to build Learning Assets from.')
      await advanceDocumentProcessingProgress(serviceClient, document.id, { stage: 'failed', errorMessage: 'We could not find the prepared content needed to finish this document.' })
      return { outcome: 'failed', error: 'We could not find the prepared content needed to finish this document.' }
    }

    const [chapterOrder, blueprintEntry] = chaptersNeedingAssets[0] as [number, ChapterIntelligenceBlueprintCacheEntry]
    const bundle = buildLearningAssets(blueprintEntry.blueprint)
    const savedBundle = await saveLearningAssetBundle(serviceClient, document.id, { chapterOrder, contentHash: blueprintEntry.contentHash, bundle })
    if (!savedBundle) {
      logGuardFailure('saveLearningAssetBundle returned false while saving a Learning Asset Bundle.')
      return { outcome: 'failed', error: 'We could not save your document. Please try again.' }
    }

    const learningAssetsGenerated = Math.min(progress.totalChapters, progress.learningAssetsGenerated + 1)
    const updated = await advanceDocumentProcessingProgress(serviceClient, document.id, { learningAssetsGenerated, stage: 'generating_learning_assets' })
    if (!updated) {
      logGuardFailure('advanceDocumentProcessingProgress returned false while recording Learning Asset generation progress.')
      return { outcome: 'failed', error: 'We could not save background processing progress.' }
    }
    logSuccess({ learningAssetsGenerated, totalChapters: progress.totalChapters, chapterOrder })

    const next = await loadDocumentProcessingProgress(serviceClient, document.id)
    return next ? { outcome: 'advanced', progress: next } : { outcome: 'no-progress' }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`[BackgroundIntelligence] ${stage} — FAIL (unexpected exception)`, {
      documentId: document.id,
      elapsedMs: Date.now() - startedAt,
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
      diagnosis: diagnoseSupabaseError({ message }),
    })
    // Phase-3-only failure — the workspace itself is left fully intact
    // (`documents.status` is never reverted away from 'workspace_ready'
    // here); only this progress row records the failure.
    await advanceDocumentProcessingProgress(serviceClient, document.id, { stage: 'failed', errorMessage: 'We hit a snag deepening your document. The parts you can already use are unaffected.' })
    return { outcome: 'failed', error: 'We hit a snag deepening your document.' }
  }
}
