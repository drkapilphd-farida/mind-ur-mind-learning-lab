'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { startModeRuntime, createLearningModeRegistry } from '@/core/learning-mode-integration'
import { buildSessionSnapshot } from '@/core/learning-session-runtime'
import { memoryLearningMode } from '@/core/learning-modes/memory-mode'
import { resolveCurrentChunkView, loadUniversalLearningObject, createSupabaseSessionPersistenceAdapter, ChunkStrategySchema } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'
import { MemoryMethodIdSchema } from '../types/MemoryMethod'

// Memory Mode™ Sprint-1, extended Sprint ALS-15. Learning Mode
// Registration + Learning Mode Loader + Session Creation, composed
// exactly like Quantum Speed Reading™'s own `startReadingSession.ts` —
// register this mode against a fresh LSE-4 registry, load the real,
// already-built ULO for `documentId` (never build one — no new parser,
// no new AI call), and delegate entirely to LSE-4's own
// `startModeRuntime`. The resulting `AdaptiveRuntimeState` is never
// persisted directly — only its real, derived `SessionSnapshot` (LSE-3)
// is, via the same Shared Learning Runtime persistence adapter QSR uses.
//
// ALS-15 — `method` (one of the six real Memory Methods) is required, not
// defaulted: unlike `chunkStrategy` (an internal scheduling detail no UI
// ever surfaces), the learner explicitly picks a method via
// `MemoryMethodPicker` before a session can start at all, so there is no
// honest default to fall back to. It has no effect on `startModeRuntime`
// itself (LSE-2 has no concept of it) — it's attached to the snapshot
// directly, the same real field `applyModeSessionDecision.ts` carries
// forward on every later decision.
const StartMemorySessionInputSchema = z.object({
  documentId: z.string().uuid(),
  chunkStrategy: ChunkStrategySchema.default('review-first'),
  method: MemoryMethodIdSchema,
})

export async function startMemorySession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = StartMemorySessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid memory session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const ulo = await loadUniversalLearningObject(supabase, parsed.data.documentId)
  if (!ulo) return { success: false, error: 'This document has not been processed into a Universal Learning Object yet.' }

  const registry = createLearningModeRegistry()
  registry.register(memoryLearningMode)

  const result = startModeRuntime(registry, 'memory', ulo, { learnerId: user.id, chunkStrategy: parsed.data.chunkStrategy })
  if (!result.success) return { success: false, error: result.error.message }

  const snapshot = { ...buildSessionSnapshot(result.state), method: parsed.data.method }
  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, memoryLearningMode.capabilities.sessionType)

  try {
    await persistence.save(snapshot)
  } catch {
    return { success: false, error: 'Failed to persist the new memory session.' }
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
