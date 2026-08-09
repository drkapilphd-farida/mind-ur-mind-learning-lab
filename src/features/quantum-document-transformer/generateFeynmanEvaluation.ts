// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { buildFeynmanEvaluationPrompt } from '@/lib/ai/prompts/feynmanEvaluationPrompt'
import { FEYNMAN_EVALUATION_TOOL } from '@/lib/ai/tools/feynmanEvaluationTool'
import { logger } from '@/lib/logger'

const MODEL = 'claude-haiku-4-5-20251001'
// A short structured reply (an integer + a couple of sentences) —
// deliberately small, same spirit as quantum-mentor's own 500-token cap
// for a single targeted response, not a whole-document job.
const MAX_OUTPUT_TOKENS = 300

const FeynmanEvaluationResultSchema = z.object({
  score: z.number().int().min(1).max(5),
  feedback: z.string().trim().min(1).max(600),
})

export type GenerateFeynmanEvaluationResult = { success: true; score: number; feedback: string; modelId: string } | { success: false; error: string }

// Mirrors generateSelectionExplanation.ts's own real, disclosed pattern:
// another Claude call site that bypasses AIFoundation entirely for the
// same documented reason as the document transformer's own tool-use call
// — AIFoundation's provider-agnostic payload has no tool-use/forced-
// schema concept to express, and this call needs a real number back, not
// prose to regex a score out of. Cost is still logged by hand into the
// same `ai_cost_log` table every other bypassing call site uses.
async function logFeynmanEvaluationCost(entry: {
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
      feature: 'feynman-challenge-evaluation',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist feynman evaluation cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist feynman evaluation cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// Interactive Feynman Challenge™ — the one on-demand Claude call this
// feature makes: a single Haiku request, forced (via `tool_choice`) to
// call `return_feynman_evaluation`, scoring a learner's own typed
// explanation against the concept they were challenged on. Nothing here
// is persisted beyond the cost log — the explanation and score are
// ephemeral, shown once and not saved, same "no persistence of the
// content itself" policy quantum-mentor's selection explanations follow.
export async function generateFeynmanEvaluation(topic: string, challengePrompt: string, learnerExplanation: string): Promise<GenerateFeynmanEvaluationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return { success: false, error: 'AI evaluation is not configured yet. Please try again later.' }
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()

  try {
    const client = new Anthropic({ apiKey, timeout: 20_000, maxRetries: 2 })

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      tools: [FEYNMAN_EVALUATION_TOOL],
      tool_choice: { type: 'tool', name: FEYNMAN_EVALUATION_TOOL.name },
      messages: [{ role: 'user', content: buildFeynmanEvaluationPrompt(topic, challengePrompt, learnerExplanation) }],
    })

    const toolUseBlock = response.content.find((block) => block.type === 'tool_use')
    const processingTimeMs = Date.now() - startedAt

    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      void logFeynmanEvaluationCost({
        requestId,
        modelId: MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        processingTimeMs,
        success: false,
        errorMessage: 'Response contained no tool_use block.',
      })
      return { success: false, error: 'We could not evaluate your explanation. Please try again.' }
    }

    const parsed = FeynmanEvaluationResultSchema.safeParse(toolUseBlock.input)
    if (!parsed.success) {
      void logFeynmanEvaluationCost({
        requestId,
        modelId: MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        processingTimeMs,
        success: false,
        errorMessage: `Tool input failed schema validation: ${parsed.error.issues[0]?.message ?? 'unknown validation error'}`,
      })
      return { success: false, error: 'We could not evaluate your explanation. Please try again.' }
    }

    void logFeynmanEvaluationCost({
      requestId,
      modelId: MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      processingTimeMs,
      success: true,
    })

    return { success: true, score: parsed.data.score, feedback: parsed.data.feedback, modelId: MODEL }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error.'
    logger.error('feynman evaluation: Anthropic call failed', {
      requestId,
      error: errorMessage,
      status: error instanceof Anthropic.APIError ? error.status : undefined,
    })
    void logFeynmanEvaluationCost({
      requestId,
      modelId: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - startedAt,
      success: false,
      errorMessage,
    })
    return { success: false, error: 'We could not evaluate your explanation. Please try again.' }
  }
}
