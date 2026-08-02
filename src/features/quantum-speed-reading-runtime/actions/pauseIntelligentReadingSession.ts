'use server'

import { IntelligentReadingSessionInputSchema } from '../types/schemas'
import type { IntelligentReadingSessionResult } from '../types/IntelligentReadingSessionResult'
import { loadIntelligentReadingContext } from './internal/loadIntelligentReadingContext'
import { resolveSessionForContext, persistAndRespond } from './internal/resolveIntelligentReadingSession'

export async function pauseIntelligentReadingSession(input: unknown): Promise<IntelligentReadingSessionResult> {
  const parsed = IntelligentReadingSessionInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid reading session request.' }

  const contextResult = await loadIntelligentReadingContext(parsed.data.documentId, parsed.data.chapterOrder)
  if (!contextResult.success) return { success: false, error: contextResult.error }

  const resolved = resolveSessionForContext(contextResult.context)
  return persistAndRespond(contextResult.context, parsed.data.documentId, parsed.data.chapterOrder, { ...resolved, paused: true })
}
