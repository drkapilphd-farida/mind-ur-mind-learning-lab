'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { startModeRuntime, createLearningModeRegistry } from '@/core/learning-mode-integration'
import { buildSessionSnapshot } from '@/core/learning-session-runtime'
import { focusLearningMode } from '@/core/learning-modes/focus-mode'
import { resolveCurrentChunkView, loadUniversalLearningObject, createSupabaseSessionPersistenceAdapter } from '@/features/learning-mode-runtime'
import type { ModeSessionActionResult } from '@/features/learning-mode-runtime'
import { FocusSessionConfigSchema, encodeFocusMethod } from '../types/FocusVariant'

// Focus Mode™ (Mini) Sprint ALS-16. Learning Mode Registration + Learning
// Mode Loader + Session Creation, composed exactly like Memory Mode™'s own
// `startMemorySession.ts` — register this mode against a fresh LSE-4
// registry, load the real, already-built ULO for `documentId` (never
// build one — no new parser, no new AI call), and delegate entirely to
// LSE-4's own `startModeRuntime`. `chunkStrategy` is always `'sequential'`
// (the only strategy `focusLearningMode` supports — see its own comment
// for why) rather than a caller-supplied input, unlike Reading/Memory.
//
// `config` (the chosen Focus variant, plus Reading Sprint's own target
// duration) is encoded into the snapshot's real, opaque `method` field —
// the exact mechanism ALS-15 built for Memory Mode's six methods, reused
// verbatim rather than adding a second generic field to `SessionSnapshot`.
const StartFocusSessionInputSchema = z.object({
  documentId: z.string().uuid(),
  config: FocusSessionConfigSchema,
})

export async function startFocusSession(input: unknown): Promise<ModeSessionActionResult> {
  const parsed = StartFocusSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid focus session request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const ulo = await loadUniversalLearningObject(supabase, parsed.data.documentId)
  if (!ulo) return { success: false, error: 'This document has not been processed into a Universal Learning Object yet.' }

  const registry = createLearningModeRegistry()
  registry.register(focusLearningMode)

  const result = startModeRuntime(registry, 'focus-mode', ulo, { learnerId: user.id, chunkStrategy: 'sequential' })
  if (!result.success) return { success: false, error: result.error.message }

  const snapshot = { ...buildSessionSnapshot(result.state), method: encodeFocusMethod(parsed.data.config) }
  const persistence = createSupabaseSessionPersistenceAdapter(supabase, user.id, focusLearningMode.capabilities.sessionType)

  try {
    await persistence.save(snapshot)
  } catch {
    return { success: false, error: 'Failed to persist the new focus session.' }
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
