'use server'

import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import { IntelligentReadingSessionInputSchema } from '../types/schemas'
import type { StartReadingJourneyResult } from '../types/IntelligentReadingSessionResult'
import { loadIntelligentReadingContext } from './internal/loadIntelligentReadingContext'
import { resolveSessionForContext, persistAndRespond } from './internal/resolveIntelligentReadingSession'

// Reading Intelligence Engine™ Upgrade — Sprint-4, extended in Sprint-5
// (Reading Journey Experience™). Starts (or, per "Smart Resume,"
// resumes) the Reading Session-driven journey for one real chapter.
// Still never touches raw chunks/Claude for the Reading Session itself —
// only the already-real, already-stored `LearningAssetBundle` (via
// `loadLearningAssetBundles`) and this learner's own real, previously-
// persisted progress marker, if any.
//
// Sprint-5 addition: the Reading Journey's own "Full Chapter Reading"
// screen needs this chapter's real original text, which the Reading
// Session/Learning Assets never stored (by design — see Sprint-2). That
// real text already exists one layer down, in the Universal Learning
// Object's own `LearningChunk.content` — the exact same real data the
// classic (non-journey) QSR modes already read via
// `loadUniversalLearningObject`. Loaded here, once, at journey start
// only — no new AI, no new pipeline, no new table.
export async function startIntelligentReadingSession(input: unknown): Promise<StartReadingJourneyResult> {
  const parsed = IntelligentReadingSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  const contextResult = await loadIntelligentReadingContext(parsed.data.documentId, parsed.data.chapterOrder)
  if (!contextResult.success) return { success: false, error: contextResult.error }

  const resolved = resolveSessionForContext(contextResult.context)
  const result = await persistAndRespond(contextResult.context, parsed.data.documentId, parsed.data.chapterOrder, resolved)
  if (!result.success) return result

  const ulo = await loadUniversalLearningObject(contextResult.context.supabase, parsed.data.documentId)
  const chunk = ulo?.knowledge.chunks.find((candidate) => candidate.location.order === parsed.data.chapterOrder)

  return { ...result, chapterFullText: chunk?.content ?? null }
}
