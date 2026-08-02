// Records a discrete AI call to the `ai_events` table
// (supabase/migrations/20260711000004_create_ai_events.sql). Every
// provider call the router makes should eventually pass through this —
// the one seam that guarantees no AI usage goes unrecorded. Not wired to
// Supabase yet; throws until a future sprint implements the insert.

import { NotImplementedError } from '@/lib/errors'
import type { AIEvent } from '@/types/ai'

export type RecordAIEventInput = Omit<AIEvent, 'id' | 'createdAt'>

export async function recordAIEvent(input: RecordAIEventInput): Promise<AIEvent> {
  throw new NotImplementedError(`recordAIEvent(eventType=${input.eventType}) — AI Events sprint`)
}
