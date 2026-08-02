'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { startModeRuntime, createLearningModeRegistry } from '@/core/learning-mode-integration'
import { buildSessionSnapshot } from '@/core/learning-session-runtime'
import { revisionLearningMode } from '@/core/learning-modes/revision-mode'
import { resolveCurrentChunkView, loadUniversalLearningObject, createSupabaseSessionPersistenceAdapter, ChunkStrategySchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Revision Mode™ Sprint ALS-17. Learning Mode Registration + Learning
// Mode Loader + Session Creation, composed exactly like Memory Mode™'s
// own `startMemorySession.ts` — register this mode against a fresh LSE-4
// registry, load the real, already-built ULO for `documentId` (never
// build one — no new parser, no new AI call), and delegate entirely to
// LSE-4's own `startModeRuntime`.
const StartRevisionSessionInputSchema = z.object({
  documentId: z.string().uuid(),
  chunkStrategy: ChunkStrategySchema.default('review-first'),
})

export async function startRevisionSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = StartRevisionSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid revision session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const ulo = await loadUniversalLearningObject(supabase, parsed.data.documentId)
  if (!ulo) return { success: false, error: 'This document has not been processed into a Universal Learning Object yet.' }

  const registry = createLearningModeRegistry()
  registry.register(revisionLearningMode)

  const result = startModeRuntime(registry, 'revision', ulo, { learnerId: user.id, chunkStrategy: parsed.data.chunkStrategy })
  if (!result.success) return { success: false, error: result.error.message }

  const snapshot = buildSessionSnapshot(result.state)
  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, revisionLearningMode.capabilities.sessionType)

  try {
    await persistence.save(snapshot)
  } catch {
    return { success: false, error: 'Failed to persist the new revision session.' }
  }

  return {
    success: true,
    snapshot,
    currentChunk: resolveCurrentChunkView(result.state, ulo),
    queueIndex: result.state.position.queueIndex,
    totalChunks: result.state.scheduledQueue.items.length,
    estimatedTimeLeftSeconds: result.state.progress.estimatedTimeLeftSeconds,
  }
}
