'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { buildQuantumJourneyCoachPrompt, type CoachFeedbackContext } from '@/lib/ai/prompts/quantumJourneyCoachPrompt'
import { logger } from '@/lib/logger'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_REPLY_TOKENS = 220

// A calm, honest degraded-state message — never a faked personalized
// reply. Same "never leave the learner staring at nothing" principle
// generateMentorReply.ts already established for this exact situation
// (missing/placeholder API key, or a genuine call failure).
const FALLBACK_MESSAGE = "Solid work today — showing up is the whole game. See you tomorrow."

async function logCoachFeedbackCost(entry: {
  requestId: string
  modelId: string
  inputTokens: number
  outputTokens: number
  processingTimeMs: number
  success: boolean
  errorMessage?: string
}): Promise<void> {
  try {
    const supabase = createServiceClient()
    const rate = DEFAULT_MODEL_PRICING[entry.modelId]
    const estimatedCostCents = rate
      ? (entry.inputTokens / 1000) * rate.inputCentsPer1kTokens + (entry.outputTokens / 1000) * rate.outputCentsPer1kTokens
      : 0

    const { error } = await supabase.from('ai_cost_log').insert({
      document_id: null,
      chunk_id: null,
      feature: 'quantum-journey-coach',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist quantum journey coach cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist quantum journey coach cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// AI Smart Coach™ — one real Claude Haiku call per day-completion,
// mirroring generateMentorReply.ts/generateSelectionExplanation.ts's own
// proven pattern (plain-text response, bypasses AIFoundation since there's
// no tool-use contract here, cost logged by hand into the same
// `ai_cost_log` table every other bypassing call site uses). Called
// directly as a Server Action from QuantumJourneySession.tsx, the same
// way saveDailyQuantumSession already is in that same component.
export async function generateCoachFeedback(context: CoachFeedbackContext): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return FALLBACK_MESSAGE
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_REPLY_TOKENS,
      messages: [{ role: 'user', content: buildQuantumJourneyCoachPrompt(context) }],
    })

    const block = response.content.find((candidate) => candidate.type === 'text')
    const success = Boolean(block && block.type === 'text')

    void logCoachFeedbackCost({
      requestId,
      modelId: MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      processingTimeMs: Date.now() - startedAt,
      success,
      ...(success ? {} : { errorMessage: 'Response contained no text block.' }),
    })

    if (!block || block.type !== 'text') return FALLBACK_MESSAGE

    return block.text.trim()
  } catch (error) {
    void logCoachFeedbackCost({
      requestId,
      modelId: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error.',
    })
    return FALLBACK_MESSAGE
  }
}
