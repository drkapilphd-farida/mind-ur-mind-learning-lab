// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { buildQuantumDocumentTransformerPrompt } from '@/lib/ai/prompts/quantumDocumentTransformerPrompt'
import { buildQuantumDocumentIntelligenceTool } from '@/lib/ai/tools/quantumDocumentIntelligenceTool'
import { buildQuantumDocumentPayloadSchema, deriveMcqQuizQuestions, type QuantumDocumentPayload } from './types'
import { computeTargetQuizQuestionCount } from './computeTargetQuizQuestionCount'
import type { SupportedLanguage } from './supportedLanguages'
import { logger } from '@/lib/logger'

const MODEL = 'claude-haiku-4-5-20251001'
// Raised from 4096 — translating the document for `reading_text` (non-
// English targets only) can itself run to several thousand output tokens
// on top of the existing summary/spider-notes/quiz/feynman/mnemonics/
// subject-lens fields, all produced in this same call.
const MAX_OUTPUT_TOKENS = 8192

// A real book chapter can run well past this many characters — capping
// what's sent to the model bounds cost and latency for one synchronous
// request/response call (per the brief's "single optimized LLM call").
// The FULL extracted text is still what gets persisted to
// `quantum_documents.raw_text` (see the Route Handler) — only the prompt
// input is truncated, never the stored record.
const MAX_PROMPT_CHARS = 60_000

// Multi-Language Support — a much smaller cap used only when translating
// (target language isn't English). Translation output scales with input
// (often larger than 1:1 — many scripts this app supports, e.g. Hindi/
// Tamil, are less token-dense per character than English), and that
// output has to share the same MAX_OUTPUT_TOKENS budget as the rest of
// this call's JSON fields. A disclosed, honest tradeoff: translated
// sessions cover a bounded portion of a very long document rather than
// risking a truncated, unparsable response for the whole thing.
const MAX_TRANSLATED_PROMPT_CHARS = 6_000

export type GenerateQuantumDocumentIntelligenceResult =
  | { success: true; payload: QuantumDocumentPayload; modelId: string }
  | { success: false; error: string }

// Mirrors generateMentorReply.ts's own real, disclosed pattern: this is
// another Claude call site that bypasses AIFoundation entirely, because
// AIFoundation's provider-agnostic AIFoundationPayload has no tool-use/
// forced-schema concept to express "call this exact tool" — the strict
// JSON contract this feature requires. Cost is logged by hand into the
// same `ai_cost_log` table AIFoundation's own calls persist to, so this
// bypass is still fully visible in cost reporting, never a blind spot.
async function logTransformerCost(entry: {
  requestId: string
  quantumDocumentId: string | null
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
      chunk_id: entry.quantumDocumentId,
      feature: 'quantum-document-transformer',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist quantum document transformer cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist quantum document transformer cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// The one optimized LLM call this feature makes: a single Claude Haiku
// request, forced (via `tool_choice`) to call `return_document_intelligence`
// so the response is structurally strict JSON, not free-form text that
// might fail to parse. Whatever the model returns is still independently
// re-validated against QuantumDocumentPayloadSchema before this function
// ever returns success — a tool-use call constrains what shape the model
// *attempts*, it does not guarantee valid lengths/counts on its own.
export async function generateQuantumDocumentIntelligence(
  documentTitle: string,
  documentText: string,
  targetLanguage: SupportedLanguage,
): Promise<GenerateQuantumDocumentIntelligenceResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return { success: false, error: 'AI Document Transformer is not configured yet. Please try again later.' }
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  const maxPromptChars = targetLanguage === 'en' ? MAX_PROMPT_CHARS : MAX_TRANSLATED_PROMPT_CHARS
  const promptText = documentText.length > maxPromptChars ? `${documentText.slice(0, maxPromptChars)}\n\n[Content truncated for length.]` : documentText

  // Smart Dynamic MCQ Assessment™ — computed from the real word count of
  // what the model actually sees (the possibly-truncated promptText, not
  // the full stored raw_text), so the requested question count never
  // exceeds what the model was actually given to draw from.
  const wordCount = promptText.trim().split(/\s+/).filter(Boolean).length
  const targetQuestionCount = computeTargetQuizQuestionCount(wordCount)

  try {
    // Explicit, not the SDK's 10-minute default — comfortably under the
    // route handler's own `maxDuration = 60`, so a stuck/overloaded model
    // call fails here with a clean JSON error instead of the platform
    // killing the whole function first. `maxRetries` is the SDK's own
    // default (2) made explicit — it already retries transient 429/5xx
    // errors with backoff before this ever reaches the catch block below.
    const client = new Anthropic({ apiKey, timeout: 50_000, maxRetries: 2 })
    const tool = buildQuantumDocumentIntelligenceTool(targetLanguage, targetQuestionCount)

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [{ role: 'user', content: buildQuantumDocumentTransformerPrompt(documentTitle, promptText, targetLanguage, targetQuestionCount) }],
    })

    const toolUseBlock = response.content.find((block) => block.type === 'tool_use')
    const processingTimeMs = Date.now() - startedAt

    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      void logTransformerCost({
        requestId,
        quantumDocumentId: null,
        modelId: MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        processingTimeMs,
        success: false,
        errorMessage: 'Response contained no tool_use block.',
      })
      return { success: false, error: 'We could not process this document. Please try again.' }
    }

    const parsed = buildQuantumDocumentPayloadSchema(targetLanguage).safeParse(toolUseBlock.input)
    if (!parsed.success) {
      void logTransformerCost({
        requestId,
        quantumDocumentId: null,
        modelId: MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        processingTimeMs,
        success: false,
        errorMessage: `Tool input failed schema validation: ${parsed.error.issues[0]?.message ?? 'unknown validation error'}`,
      })
      return { success: false, error: 'We could not process this document. Please try again.' }
    }

    void logTransformerCost({
      requestId,
      quantumDocumentId: null,
      modelId: MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      processingTimeMs,
      success: true,
    })

    // Smart Dynamic MCQ Assessment™ — shuffle each question's options and
    // derive the final correctIndex only now, after validation, never
    // trusting the model's own option ordering to be the storage order.
    const payload: QuantumDocumentPayload = {
      ...parsed.data,
      quiz_questions: deriveMcqQuizQuestions(parsed.data.quiz_questions),
    }

    return { success: true, payload, modelId: MODEL }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error.'
    // Previously this real cause only reached `ai_cost_log.error_message`
    // — invisible in server logs, so an Anthropic-side failure (rate
    // limit, overload, timeout, invalid request) looked identical to
    // every other failure from the outside. This is the only place that
    // error is otherwise lost.
    logger.error('quantum document transformer: Anthropic call failed', {
      requestId,
      error: errorMessage,
      status: error instanceof Anthropic.APIError ? error.status : undefined,
    })
    void logTransformerCost({
      requestId,
      quantumDocumentId: null,
      modelId: MODEL,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - startedAt,
      success: false,
      errorMessage,
    })
    return { success: false, error: 'We could not process this document. Please try again.' }
  }
}
