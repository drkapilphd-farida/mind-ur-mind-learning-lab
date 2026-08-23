// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { buildQuantumMentorExplainSelectionPrompt } from '@/lib/ai/prompts/quantumMentorExplainSelectionPrompt'
import type { SelectionActionType } from './types'
import type { SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'
import { logger } from '@/lib/logger'

const MODEL = 'claude-haiku-4-5-20251001'
// A targeted, few-sentence response — deliberately small next to the
// document-transformer's 8192, since this call answers one highlighted
// selection, not a whole document.
const MAX_OUTPUT_TOKENS = 500

export type GenerateSelectionExplanationResult = { success: true; explanation: string; modelId: string } | { success: false; error: string }

// Mirrors generateMentorReply.ts's own real, disclosed pattern: another
// Claude call site that bypasses AIFoundation entirely, because this is a
// plain-text response (no tool-use/forced-schema contract to express) and
// AIFoundation's provider-agnostic payload has no concept for that. Cost
// is still logged by hand into the same `ai_cost_log` table every other
// bypassing call site uses, so it's never a blind spot in cost reporting.
async function logSelectionExplanationCost(entry: {
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
      feature: 'quantum-mentor-selection',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist quantum mentor selection cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist quantum mentor selection cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// Text Selection & Interactive AI Mentor Copilot™ — the one Claude call
// this feature makes: a single Haiku request answering exactly the
// highlighted selection (plus light surrounding context), for one of the
// three quick actions (explain simply / real-world examples / simplify).
// Plain-text response, not tool-use — there's no structured shape to
// force here, just a short piece of prose to render as-is in the drawer.
export async function generateSelectionExplanation(
  selectedText: string,
  surroundingContext: string | undefined,
  actionType: SelectionActionType,
  targetLanguage?: SupportedLanguage,
): Promise<GenerateSelectionExplanationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return { success: false, error: "Dr. Kapil's mentorship tools aren't configured yet. Please try again later." }
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: 'user', content: buildQuantumMentorExplainSelectionPrompt(selectedText, surroundingContext, actionType, targetLanguage) }],
    })

    const block = response.content.find((candidate) => candidate.type === 'text')
    const processingTimeMs = Date.now() - startedAt

    if (!block || block.type !== 'text') {
      void logSelectionExplanationCost({
        requestId,
        modelId: MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        processingTimeMs,
        success: false,
        errorMessage: 'Response contained no text block.',
      })
      return { success: false, error: 'We could not generate an explanation. Please try again.' }
    }

    void logSelectionExplanationCost({
      requestId,
      modelId: MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      processingTimeMs,
      success: true,
    })

    return { success: true, explanation: block.text.trim(), modelId: MODEL }
  } catch (error) {
    void logSelectionExplanationCost({
      requestId,
      modelId: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error.',
    })
    return { success: false, error: 'We could not generate an explanation. Please try again.' }
  }
}
