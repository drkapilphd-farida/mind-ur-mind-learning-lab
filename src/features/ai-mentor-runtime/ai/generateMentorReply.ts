// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'
import { buildMentorSystemPrompt } from './buildMentorSystemPrompt'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { logger } from '@/lib/logger'
import type { MentorSessionContext } from '../types/MentorSessionContext'
import type { MentorConversationTurn } from '../types/MentorConversationTurn'

// A calm, honest degraded-state message — never a faked personalized
// reply. Unlike `generateMentorMessage.ts`'s own fallback (a deterministic
// template appropriate for a one-shot dashboard card), fabricating a
// "smart-sounding" conversational reply without the real model would be
// exactly the kind of mock/placeholder implementation this sprint's own
// rules forbid for an actual conversation. The real primary path below is
// what does the real work; this is only reached on a genuine
// configuration or API failure.
const FALLBACK_REPLY = "I'm here with you, though I can't respond just yet — please try again in a moment."

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_REPLY_TOKENS = 400

// Production AI Cost Optimization — Task 5, Path B. This is the one real
// Claude call site in the whole app that bypasses AIFoundation entirely
// (confirmed by this mission's own cost audit) — nothing about
// AIFoundation's own CostTracker ever sees it. Logged here, directly, into
// the same `ai_cost_log` table AIFoundation's real calls now persist to
// (via createSupabaseCostTracker.ts), so a real cost report never has a
// blind spot for AI Mentor. `document_id` is honestly null: this call
// site only ever receives `MentorSessionContext`'s own summary fields
// (title/section headings), never a real document id to attribute the
// call to — logging a guessed id would be worse than logging none.
// Observability only — a failure here is logged and swallowed, never
// allowed to affect the real reply already computed.
function estimateMentorCallCostCents(modelId: string, inputTokens: number, outputTokens: number): number {
  const rate = DEFAULT_MODEL_PRICING[modelId]
  if (!rate) return 0
  return (inputTokens / 1000) * rate.inputCentsPer1kTokens + (outputTokens / 1000) * rate.outputCentsPer1kTokens
}

async function logMentorCost(entry: { requestId: string; modelId: string; inputTokens: number; outputTokens: number; processingTimeMs: number; success: boolean; errorMessage?: string }): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('ai_cost_log').insert({
      document_id: null,
      chunk_id: null,
      feature: 'ai-mentor',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimateMentorCallCostCents(entry.modelId, entry.inputTokens, entry.outputTokens),
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist ai mentor cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist ai mentor cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// AI Mentor™ Sprint-2 — the first real conversation turn. Calls the
// Anthropic API directly (same model as `generateMentorMessage.ts` and
// `ai-tutor`'s own `chatWithTutor`), with the real, already-persisted
// turn history mapped to Anthropic's own `messages` shape
// (`'learner' → 'user'`, `'mentor' → 'assistant'`) and the real
// cross-module context folded into the system prompt. Falls back to a
// calm, honest, non-fabricated message on a missing/placeholder API key
// or any real call failure — the same "never leave the learner staring
// at a blank/error state" principle `generateMentorMessage.ts` already
// established, applied honestly here rather than faking a personalized
// reply.
export async function generateMentorReply(context: MentorSessionContext, turns: readonly MentorConversationTurn[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return FALLBACK_REPLY
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_REPLY_TOKENS,
      system: buildMentorSystemPrompt(context),
      messages: turns.map((turn) => ({ role: turn.role === 'mentor' ? ('assistant' as const) : ('user' as const), content: turn.content })),
    })

    const block = response.content.find((candidate) => candidate.type === 'text')
    const success = Boolean(block && block.type === 'text')

    void logMentorCost({
      requestId,
      modelId: MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      processingTimeMs: Date.now() - startedAt,
      success,
      ...(success ? {} : { errorMessage: 'Response contained no text block.' }),
    })

    if (!block || block.type !== 'text') return FALLBACK_REPLY

    return block.text.trim()
  } catch (error) {
    void logMentorCost({
      requestId,
      modelId: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error.',
    })
    return FALLBACK_REPLY
  }
}
