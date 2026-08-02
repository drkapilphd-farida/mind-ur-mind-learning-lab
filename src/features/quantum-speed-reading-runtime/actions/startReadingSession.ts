'use server'

import { createClient } from '@/lib/supabase/server'
import { startModeRuntime, createLearningModeRegistry } from '@/core/learning-mode-integration'
import { buildSessionSnapshot } from '@/core/learning-session-runtime'
import { quantumSpeedReadingMode } from '@/core/learning-modes/quantum-speed-reading'
import { resolveCurrentChunkView } from '@/features/learning-mode-runtime/orchestration/resolveCurrentChunkView'
import { loadUniversalLearningObject } from '../persistence/loadUniversalLearningObject'
import { createSupabaseSessionPersistenceAdapter } from '../persistence/createSupabaseSessionPersistenceAdapter'
import { StartReadingSessionInputSchema } from '../types/schemas'
import type { ReadingSessionActionResult } from '../types/ReadingSessionActionResult'

// Quantum Speed Reading™ Production Sprint-1. Learning Mode Registration +
// Learning Mode Loader + Session Creation, composed: register this mode
// against a fresh LSE-4 registry, load the real, already-built ULO for
// `documentId` (never build one — no new parser, no new AI call), and
// delegate entirely to LSE-4's own `startModeRuntime` for real session
// construction. The resulting `AdaptiveRuntimeState` is never persisted
// directly — only its real, derived `SessionSnapshot` (LSE-3) is, the
// same bounded-persistence discipline every other action in this feature
// follows.
export async function startReadingSession(input: unknown): Promise<ReadingSessionActionResult> {
  const parsed = StartReadingSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const ulo = await loadUniversalLearningObject(supabase, parsed.data.documentId)
  if (!ulo) return { success: false, error: 'This document has not been processed into a Universal Learning Object yet.' }

  const registry = createLearningModeRegistry()
  registry.register(quantumSpeedReadingMode)

  const result = startModeRuntime(registry, 'quantum-speed-reading', ulo, { learnerId: user.id, chunkStrategy: parsed.data.chunkStrategy })
  if (!result.success) return { success: false, error: result.error.message }

  const snapshot = buildSessionSnapshot(result.state)
  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id)

  try {
    await persistence.save(snapshot)
  } catch {
    return { success: false, error: 'Failed to persist the new reading session.' }
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
