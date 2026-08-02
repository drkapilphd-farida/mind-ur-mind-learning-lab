'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { buildPreSessionBriefingPrompt, type PreSessionBriefingContext } from '@/lib/ai/prompts/preSessionBriefingPrompt'
import { logger } from '@/lib/logger'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_REPLY_TOKENS = 150

// A calm, honest degraded-state message — never a faked personalized
// reply. Same "never leave the learner staring at nothing" principle
// generateCoachFeedback.ts's own FALLBACK_MESSAGE already established.
function getFallbackBriefingMessage(context: PreSessionBriefingContext): string {
  if (context.isBaselineDay) {
    return `Welcome to Day ${context.day}, ${context.studentName}! This is where your journey begins — let's set your real baseline today.`
  }
  if (context.previousWpm !== null && context.previousAccuracyPercent !== null) {
    return `Welcome back, ${context.studentName}! Last session you read at ${context.previousWpm} WPM with ${context.previousAccuracyPercent}% comprehension. Let's keep building today.`
  }
  return `Welcome to Day ${context.day}, ${context.studentName}! Let's make today count.`
}

async function logPreSessionBriefingCost(entry: {
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
      feature: 'quantum-journey-pre-session-briefing',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist pre-session briefing cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist pre-session briefing cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// Pre-Session AI Coach Welcome & Briefing™ — one real Claude Haiku call
// shown before today's session begins, mirroring generateCoachFeedback.ts's
// own proven pattern exactly (plain-text response, bypasses AIFoundation
// since there's no tool-use contract here, cost logged by hand into the
// same `ai_cost_log` table). Called client-side from
// PreSessionBriefingScreen.tsx on mount — the "Start Today's Session" CTA
// is never gated behind this call finishing; a slow or failed AI call
// must never delay real progress.
export async function generatePreSessionBriefing(context: PreSessionBriefingContext): Promise<string> {
  const fallback = getFallbackBriefingMessage(context)

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
      messages: [{ role: 'user', content: buildPreSessionBriefingPrompt(context) }],
    })

    const block = response.content.find((candidate) => candidate.type === 'text')
    const success = Boolean(block && block.type === 'text')

    void logPreSessionBriefingCost({
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
    void logPreSessionBriefingCost({
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
