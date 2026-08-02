'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { startModeRuntime, createLearningModeRegistry } from '@/core/learning-mode-integration'
import { buildSessionSnapshot } from '@/core/learning-session-runtime'
import { researchLearningMode } from '@/core/learning-modes/research-mode'
import { resolveCurrentChunkView, loadUniversalLearningObject, createSupabaseSessionPersistenceAdapter, ChunkStrategySchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'

// Research Mode™ — Production AI Integration (ALS-24). Learning Mode
// Registration + Learning Mode Loader + Session Creation, composed
// exactly like Revision Mode™'s own `startRevisionSession.ts` — register
// this mode against a fresh LSE-4 registry, load the real, already-built
// ULO for `documentId` (never build one — no new parser, no new AI
// call), and delegate entirely to LSE-4's own `startModeRuntime`.
const StartResearchSessionInputSchema = z.object({
  documentId: z.string().uuid(),
  chunkStrategy: ChunkStrategySchema.default('dependency-first'),
})

export async function startResearchSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = StartResearchSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid research session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const ulo = await loadUniversalLearningObject(supabase, parsed.data.documentId)
  if (!ulo) return { success: false, error: 'This document has not been processed into a Universal Learning Object yet.' }

  const registry = createLearningModeRegistry()
  registry.register(researchLearningMode)

  const result = startModeRuntime(registry, 'research', ulo, { learnerId: user.id, chunkStrategy: parsed.data.chunkStrategy })
  if (!result.success) return { success: false, error: result.error.message }

  const snapshot = buildSessionSnapshot(result.state)
  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, researchLearningMode.capabilities.sessionType)

  try {
    await persistence.save(snapshot)
  } catch {
    return { success: false, error: 'Failed to persist the new research session.' }
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
