'use server'

import { z } from 'zod'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { loadLearningAssetBundles } from '@/features/learning-mode-runtime/persistence/learningAssetBundles'
import { loadChapterIntelligenceBlueprints } from '@/features/learning-mode-runtime/persistence/chapterIntelligenceBlueprints'
import { loadQuantumJourneyProgress, isQuantumJourneyChapterCompleted, type QuantumJourneyProgressRecord } from '@/features/learning-mode-runtime/persistence/quantumJourneySessionRecord'
import { buildExerciseAssets, buildChunkExerciseAssets, buildWordExerciseAssets, type WordExerciseAsset, type ChunkExerciseAsset, type AssessmentExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'
import { generateReadingSession } from '@/core/universal-learning-engine/reading-experience'
import type { PhraseAsset, SentenceAsset, ParagraphAsset } from '@/core/universal-learning-engine/learning-assets'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'

const LoadQuantumJourneyChapterInputSchema = z.object({
  documentId: z.string().uuid(),
  chapterOrder: z.number().int().min(0).default(0),
})

export type LoadQuantumJourneyChapterResult =
  | {
      success: true
      documentId: string
      documentTitle: string
      chapterOrder: number
      totalChapters: number
      wordAssets: readonly WordExerciseAsset[]
      chunkAssets: readonly ChunkExerciseAsset[]
      // Sprint QSR-2.6 — Quantum Experience Parity™. The Journey's Word
      // Chunk stage reuses the real Progressive Chunk Reading™ mission,
      // which needs far more distinct chunks than one chapter supplies to
      // reach its higher mastery levels — so this is every chapter's real
      // chunks combined, not just this one. `chunkAssets` above stays
      // chapter-scoped for anything that still wants that.
      documentChunkAssets: readonly ChunkExerciseAsset[]
      // Sprint QSR-3 — Word Flash Experience Unification™. Same rationale
      // as documentChunkAssets: the real Word Flash mission's own 5-level
      // ramp draws from more distinct words than one chapter reliably
      // supplies, so this is every chapter's real words combined.
      documentWordAssets: readonly WordExerciseAsset[]
      assessmentAssets: readonly AssessmentExerciseAsset[]
      // QSR-INTEGRATION-1 — real per-chapter phrase/sentence/paragraph
      // assets, selected/deduped/sorted by the existing, unmodified Asset
      // Selection Engine™ (`generateReadingSession`, Sprint-3) from this
      // same already-loaded `LearningAssetBundle` — no new AI, no new
      // query, no new selection logic.
      phraseAssets: readonly PhraseAsset[]
      sentenceAssets: readonly SentenceAsset[]
      paragraphAssets: readonly ParagraphAsset[]
      // QSR-ENGINE-SWAP-1 — whole-document phrase/sentence pools, same
      // rationale as documentWordAssets/documentChunkAssets: the real
      // Phrase/Sentence Reading missions need more distinct real items
      // than one chapter reliably supplies to fill 5 mastery levels.
      documentPhraseAssets: readonly PhraseAsset[]
      documentSentenceAssets: readonly SentenceAsset[]
      // Real chapter text for Reading Sprint — the same source
      // buildChunkExerciseAssets already reads below.
      chapterContent: string
      sessionId: string | null
      progress: QuantumJourneyProgressRecord
    }
  | { success: false; error: string }

function freshProgress(documentId: string, chapterOrder: number): QuantumJourneyProgressRecord {
  return {
    documentId,
    chapterOrder,
    stage: 'chapter-ready',
    wordFlashCompleted: false,
    chunkReadingCompleted: false,
    phraseReadingCompleted: false,
    sentenceReadingCompleted: false,
    paragraphReadingCompleted: false,
    readingSprintCompleted: false,
    assessmentCompleted: false,
    assessmentScore: null,
  }
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
// Integration™. Read-only chapter load for the Quantum Reading Journey™.
// Mirrors loadIntelligentReadingContext.ts's own real, proven security
// shape exactly: one explicit ownership check via the user-scoped client
// BEFORE the service-role client ever reads the RLS-restricted
// chapter_intelligence_blueprints/learning_asset_bundles tables — never
// trusting documentId alone. Exercise Assets are never persisted here —
// buildExerciseAssets (Sprint QSR-1, unmodified) is a pure, ~2ms
// derivation of already-cached data, rebuilt fresh on every chapter visit
// and held client-side for that visit's three stages, so "no duplicate
// generation" holds without a new cache table.
//
// Server-side sequencing enforcement (never just client-side hiding):
// chapter N > 0 is refused unless chapter N-1's own qsr-journey session
// has genuinely completed — the same "never trust the client to enforce
// order" discipline verifyExerciseIsUnlocked already applies to the
// classic locked exercise sequences.
export async function loadQuantumJourneyChapter(input: unknown): Promise<LoadQuantumJourneyChapterResult> {
  const startedAt = Date.now()
  const parsed = LoadQuantumJourneyChapterInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading journey request.' }
  const { documentId, chapterOrder } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const { data: document, error: documentError } = await supabase.from('documents').select('id, title').eq('id', documentId).eq('user_id', user.id).maybeSingle()
  if (documentError || !document) return { success: false, error: 'This document could not be found.' }

  if (chapterOrder > 0) {
    const previousChapterCompleted = await isQuantumJourneyChapterCompleted(supabase, user.id, documentId, chapterOrder - 1)
    if (!previousChapterCompleted) return { success: false, error: 'Complete the previous chapter first.' }
  }

  const serviceClient = createServiceClient()
  const bundles = await loadLearningAssetBundles(serviceClient, documentId)
  if (bundles.size === 0) return { success: false, error: 'This document has no real Learning Assets yet — processing may still be in progress.' }

  const bundleEntry = bundles.get(chapterOrder)
  if (!bundleEntry) return { success: false, error: 'This chapter does not exist for this document.' }

  const blueprints = await loadChapterIntelligenceBlueprints(serviceClient, documentId)
  const blueprintEntry = blueprints.get(chapterOrder)

  const ulo = await loadUniversalLearningObject(serviceClient, documentId)
  const chunk = ulo?.knowledge.chunks.find((candidate) => candidate.location.order === chapterOrder)
  const chapterContent = chunk?.content ?? ''

  const result = buildExerciseAssets({
    documentId,
    chapterId: bundleEntry.bundle.chapterId,
    chapterContent,
    locale: blueprintEntry?.blueprint.header.language ?? null,
    bundle: bundleEntry.bundle,
    assessmentMcqs: blueprintEntry?.blueprint.assessmentAssets.mcqs ?? [],
  })

  // Whole-document chunk pool (Sprint QSR-2.6) — buildChunkExerciseAssets
  // only needs raw chapter text, no Blueprint/Bundle, so every chapter's
  // chunks can be built here regardless of that chapter's own processing
  // state.
  const documentChunkAssets = (ulo?.knowledge.chunks ?? []).flatMap((docChunk) => buildChunkExerciseAssets(docChunk.content, docChunk.id))

  // Whole-document word pool (Sprint QSR-3) — every chapter's bundle is
  // already loaded above (`bundles`); buildWordExerciseAssets only needs
  // one chapter's bundle, so this reuses that same already-fetched data,
  // no new query.
  const documentWordAssets = [...bundles.values()].flatMap((entry) => buildWordExerciseAssets(entry.bundle, { locale: blueprintEntry?.blueprint.header.language ?? 'en' }))

  // QSR-INTEGRATION-1 — real phrase/sentence/paragraph assets for this
  // chapter, via the existing, unmodified Reading Experience Engine™'s
  // public `generateReadingSession` (deterministic, zero AI, zero new
  // query — same `bundleEntry.bundle` already loaded above).
  const readingSession = generateReadingSession(bundleEntry.bundle)

  // QSR-ENGINE-SWAP-1 — whole-document phrase/sentence pools (same
  // already-loaded `bundles`, no new query), deduped by normalized text
  // across every chapter's own real assets, real reading order preserved.
  function dedupeByText<T>(items: readonly T[], textOf: (item: T) => string): readonly T[] {
    const seen = new Map<string, T>()
    for (const item of items) {
      const key = textOf(item).trim().toLowerCase()
      if (!seen.has(key)) seen.set(key, item)
    }
    return [...seen.values()]
  }
  const documentPhraseAssets = dedupeByText(
    [...bundles.values()].flatMap((entry) => entry.bundle.phraseAssets),
    (asset) => asset.phrase,
  )
  const documentSentenceAssets = dedupeByText(
    [...bundles.values()].flatMap((entry) => entry.bundle.sentenceAssets),
    (asset) => asset.keySentence,
  )

  const existing = await loadQuantumJourneyProgress(supabase, user.id, documentId, chapterOrder)

  logger.info('quantum reading journey: chapter loaded', {
    documentId,
    chapterOrder,
    totalChapters: bundles.size,
    loadTimeMs: Date.now() - startedAt,
    resumed: existing !== null,
  })

  return {
    success: true,
    documentId,
    documentTitle: document.title,
    chapterOrder,
    totalChapters: bundles.size,
    wordAssets: result.words,
    chunkAssets: result.chunks,
    documentChunkAssets,
    documentWordAssets,
    assessmentAssets: result.assessments,
    phraseAssets: readingSession.assets.phrases,
    sentenceAssets: readingSession.assets.sentences,
    paragraphAssets: readingSession.assets.paragraphs,
    documentPhraseAssets,
    documentSentenceAssets,
    chapterContent,
    sessionId: existing?.sessionId ?? null,
    progress: existing?.record ?? freshProgress(documentId, chapterOrder),
  }
}
