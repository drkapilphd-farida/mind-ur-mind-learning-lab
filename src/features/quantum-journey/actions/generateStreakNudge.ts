'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { buildStreakNudgePrompt, type StreakNudgeContext } from '@/lib/ai/prompts/streakNudgePrompt'
import { logger } from '@/lib/logger'
import type { StreakBannerStatus } from '../streakMotivation'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_REPLY_TOKENS = 120

// A calm, honest degraded-state message per banner status — never a
// faked personalized reply. Same "never leave the learner staring at
// nothing" principle generateCoachFeedback.ts's own FALLBACK_MESSAGE
// already established, just one per real situation instead of one
// generic line, since these 5 situations call for genuinely different
// framing (a fresh start reads very differently from a broken streak).
function getFallbackNudgeMessage(status: StreakBannerStatus, nextDay: number, currentStreak: number): string {
  switch (status) {
    case 'not-started':
      return 'Your 21-Day Transformation Journey is ready whenever you are — Day 1 takes just a few minutes.'
    case 'completed-today':
      return `Day ${nextDay - 1} done — ${currentStreak}-day streak going strong. See you tomorrow for Day ${nextDay}.`
    case 'streak-active':
      return `Day ${nextDay} is waiting for you — keep your ${currentStreak}-day streak alive!`
    case 'streak-broken':
      return `Day ${nextDay} is ready whenever you are — every streak starts with a single day.`
    case 'journey-complete':
      return "You've completed all 21 days — a real, genuine achievement."
  }
}

async function logStreakNudgeCost(entry: {
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
      feature: 'quantum-journey-streak-nudge',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist streak nudge cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist streak nudge cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// Daily Streak Reminders & Motivation System™ — one real Claude Haiku
// call per dashboard load, mirroring generateCoachFeedback.ts's own
// proven pattern exactly (plain-text response, bypasses AIFoundation
// since there's no tool-use contract here, cost logged by hand into the
// same `ai_cost_log` table). Called from a Suspense-streamed Server
// Component (StreakReminderBanner.tsx) the same way AIMentorSection.tsx
// already calls generateMentorMessage.
export async function generateStreakNudge(context: StreakNudgeContext): Promise<string> {
  const fallback = getFallbackNudgeMessage(context.status, context.nextDay, context.currentStreak)

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
      messages: [{ role: 'user', content: buildStreakNudgePrompt(context) }],
    })

    const block = response.content.find((candidate) => candidate.type === 'text')
    const success = Boolean(block && block.type === 'text')

    void logStreakNudgeCost({
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
    void logStreakNudgeCost({
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
