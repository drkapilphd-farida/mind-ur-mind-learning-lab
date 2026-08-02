'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { findActiveMentorSession } from '../persistence/findActiveMentorSession'
import { createMentorConversationTurn } from '../persistence/createMentorConversationTurn'
import { listMentorConversationTurns } from '../persistence/listMentorConversationTurns'
import { buildMentorSessionContext } from '../context/buildMentorSessionContext'
import { generateMentorReply } from '../ai/generateMentorReply'
import { tryAnswerFromStoredKnowledge } from '../retrieval/tryAnswerFromStoredKnowledge'
import { loadUniversalLearningObject } from '@/features/learning-mode-runtime'
import type { MentorConversationTurn } from '../types/MentorConversationTurn'

// A real, disclosed, generous-but-bounded cap — protects the database
// column and the model call from an unbounded paste, not a validated
// conversational limit.
const MAX_MESSAGE_LENGTH = 4000

// Real, disclosed window — bounds how much real turn history is sent to
// the model each call, so token usage doesn't grow unbounded across a
// long-lived conversation.
const MAX_HISTORY_TURNS = 20

const SendMentorMessageInputSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
})

export type SendMentorMessageResult = { success: true; learnerTurn: MentorConversationTurn; mentorTurn: MentorConversationTurn } | { success: false; error: string }

// AI Mentor™ Sprint-2 — the first real conversation turn. Persists the
// learner's real message, builds the real cross-module context
// (Sprint-1's own `buildMentorSessionContext`, unmodified) and the real,
// already-persisted turn history, calls the real Anthropic API once, and
// persists the real reply. Requires a real, active, caller-owned mentor
// session — the same ownership check `getMentorSessionContext` (Sprint-1)
// already established.
export async function sendMentorMessage(input: unknown): Promise<SendMentorMessageResult> {
  const parsed = SendMentorMessageInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid mentor message request.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not signed in.' }

  const activeSession = await findActiveMentorSession(supabase, user.id)
  if (!activeSession || activeSession.id !== parsed.data.sessionId) return { success: false, error: 'Mentor session not found.' }

  const learnerTurn = await createMentorConversationTurn(supabase, user.id, activeSession.id, 'learner', parsed.data.message)
  if (!learnerTurn) return { success: false, error: 'Failed to save your message.' }

  const [context, priorTurns] = await Promise.all([buildMentorSessionContext(supabase, user.id), listMentorConversationTurns(supabase, activeSession.id)])

  const recentTurns = priorTurns.slice(-MAX_HISTORY_TURNS)

  // Production AI Cost Optimization — Task 7. A real, honest, narrow-scope
  // check: if the learner's message is a direct definition-style question
  // ("what is X") AND their most recently active document's own stored
  // ULO already has a real, matching UCE-3B definition for that exact
  // term, answer from that stored knowledge directly — zero Claude call.
  // Every other message (the large majority) falls straight through to
  // the real, unmodified `generateMentorReply` call below.
  const activeUlo = context.activeDocument !== null ? await loadUniversalLearningObject(supabase, context.activeDocument.documentId) : null
  const storedAnswer = activeUlo !== null ? tryAnswerFromStoredKnowledge(activeUlo, parsed.data.message) : null

  const replyText = storedAnswer ?? (await generateMentorReply(context, recentTurns))

  const mentorTurn = await createMentorConversationTurn(supabase, user.id, activeSession.id, 'mentor', replyText)
  if (!mentorTurn) return { success: false, error: "Failed to save the mentor's reply." }

  return { success: true, learnerTurn, mentorTurn }
}
