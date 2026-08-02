'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { buildJourneyCompletionSummaryPrompt, type JourneyCompletionSummaryContext } from '@/lib/ai/prompts/journeyCompletionSummaryPrompt'
import { logger } from '@/lib/logger'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_REPLY_TOKENS = 180

// A calm, honest degraded-state message — never a faked personalized
// reply. Same "never leave the learner staring at nothing" principle
// generateCoachFeedback.ts's own FALLBACK_MESSAGE already established.
function getFallbackSummaryMessage(context: JourneyCompletionSummaryContext): string {
  if (context.growthPercent !== null && context.growthPercent > 0) {
    return `You did it — 21 real days, from ${context.baselineWpm} WPM to ${context.finalWpm} WPM. That's ${context.growthPercent}% real growth. Genuinely well done.`
  }
  return `You completed all 21 real days — from ${context.baselineWpm} WPM to ${context.finalWpm} WPM at ${context.finalAccuracyPercent}% comprehension. A real, genuine achievement.`
}

async function logJourneyCompletionSummaryCost(entry: {
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
      feature: 'quantum-journey-completion-summary',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist journey completion summary cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist journey completion summary cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// Day 21 Completion Certificate™ — one real Claude Haiku call for the
// single proudest moment in the whole journey, mirroring
// generateCoachFeedback.ts's own proven pattern exactly (plain-text
// response, bypasses AIFoundation since there's no tool-use contract
// here, cost logged by hand into the same `ai_cost_log` table).
export async function generateJourneyCompletionSummary(context: JourneyCompletionSummaryContext): Promise<string> {
  const fallback = getFallbackSummaryMessage(context)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return fallback
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_REPLY_TOKENS,
      messages: [{ role: 'user', content: buildJourneyCompletionSummaryPrompt(context) }],
    })

    const block = response.content.find((candidate) => candidate.type === 'text')
    const success = Boolean(block && block.type === 'text')

    void logJourneyCompletionSummaryCost({
      requestId,
      modelId: MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      processingTimeMs: Date.now() - startedAt,
      success,
      ...(success ? {} : { errorMessage: 'Response contained no text block.' }),
    })

    if (!block || block.type !== 'text') return fallback

    return block.text.trim()
  } catch (error) {
    void logJourneyCompletionSummaryCost({
      requestId,
      modelId: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error.',
    })
    return fallback
  }
}
