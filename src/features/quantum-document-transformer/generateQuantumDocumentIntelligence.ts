// Server-only. Never import this from client components.
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { QUANTUM_DOCUMENT_TRANSFORMER_SYSTEM_PROMPT, buildQuantumDocumentTransformerUserMessage } from '@/lib/ai/prompts/quantumDocumentTransformerPrompt'
import { buildQuantumDocumentIntelligenceTool } from '@/lib/ai/tools/quantumDocumentIntelligenceTool'
import { buildQuantumDocumentPayloadSchema, deriveMcqQuizQuestions, type QuantumDocumentPayload } from './types'
import { computeTargetQuizQuestionCount } from './computeTargetQuizQuestionCount'
import { computeDocumentContentHash, getCachedAnalysis, saveCachedAnalysis } from './documentAnalysisCache'
import type { SupportedLanguage } from './supportedLanguages'
import { logger } from '@/lib/logger'

const MODEL = 'claude-haiku-4-5-20251001'

// AI Cost Optimization™ — Token Payload Optimization. Right-sized to the
// realistic worst case (20 MCQ questions + every other field, English —
// the no-translation case has no reading_text competing for the same
// budget) rather than a round-number ceiling picked without a reason.
// This is a safety CAP on cost/latency, not itself a savings mechanism —
// Anthropic bills for tokens actually generated, not max_tokens — the
// real output-side lever is the model simply not needing to write more
// than this in practice.
const MAX_OUTPUT_TOKENS = 4096

// AI Cost Optimization™ — Token Payload Optimization. Lowered from
// 60,000: input tokens scale linearly with what's sent, so this constant
// is the single biggest lever over typical-case cost after
// deduplication. 24,000 characters is still a genuinely large chunk (a
// full book chapter, not a snippet) — comfortably enough real material
// for an accurate summary/spider-map/quiz — while cutting the previous
// worst-case input by more than half. The FULL extracted text is still
// what gets persisted to `quantum_documents.raw_text` (see the Route
// Handler) — only the prompt input is trimmed, never the stored record.
const MAX_PROMPT_CHARS = 24_000

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
// `cacheReadTokens`/`cacheWriteTokens` are logged too (0 for a cache-hit
// short-circuit or a request that never reached Anthropic) so the real
// savings from prompt caching are visible in the same table, not just
// asserted.
async function logTransformerCost(entry: {
  requestId: string
  quantumDocumentId: string | null
  modelId: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
  processingTimeMs: number
  success: boolean
  errorMessage?: string
}): Promise<void> {
  try {
    const supabase = createServiceClient()
    const rate = DEFAULT_MODEL_PRICING[entry.modelId]
    // Cache reads bill at Anthropic's published ~10% of the normal input
    // rate (a ~90% discount); cache writes bill at a ~25% premium over
    // the normal input rate for the one call that populates the cache.
    // Both are estimates in the same disclosed spirit ModelPricing.ts's
    // own rates already are — not confirmed line items from a real
    // invoice.
    const estimatedCostCents = rate
      ? (entry.inputTokens / 1000) * rate.inputCentsPer1kTokens +
        (entry.outputTokens / 1000) * rate.outputCentsPer1kTokens +
        ((entry.cacheReadTokens ?? 0) / 1000) * rate.inputCentsPer1kTokens * 0.1 +
        ((entry.cacheWriteTokens ?? 0) / 1000) * rate.inputCentsPer1kTokens * 1.25
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
//
// AI Cost Optimization™ — three real, stacked savings, cheapest-first:
//   1. Global dedup cache: if this exact text (post-truncation) was ever
//      analyzed before, for any student, in this target language, that
//      stored result is returned immediately — zero Claude tokens, zero
//      Claude cost, for this call.
//   2. Prompt caching: on a genuine cache MISS, the large static
//      instruction block still gets sent, but marked so Anthropic caches
//      it — the next call within the cache window (any student, any
//      document, any language) reads it at a steep discount instead of
//      full price.
//   3. Trimmed prompt input + a right-sized output ceiling, so a call
//      that does have to go to Claude sends and requests less to begin
//      with.
export async function generateQuantumDocumentIntelligence(
  documentTitle: string,
  documentText: string,
  targetLanguage: SupportedLanguage,
  // Quick Overview™ — true only for a YouTube import that fell back to
  // real title/description (no transcript available). Adds one
  // reinforcing, uncached instruction (see METADATA_ONLY_SOURCE_NOTE)
  // asking for the best honest writing that thinner material supports —
  // never a license to invent. Every other call site (file upload,
  // website import, a YouTube import that DID get a real transcript)
  // omits this and behaves exactly as before.
  isMetadataOnly = false,
): Promise<GenerateQuantumDocumentIntelligenceResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    return { success: false, error: 'AI Document Transformer is not configured yet. Please try again later.' }
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  const maxPromptChars = targetLanguage === 'en' ? MAX_PROMPT_CHARS : MAX_TRANSLATED_PROMPT_CHARS
  const promptText = documentText.length > maxPromptChars ? `${documentText.slice(0, maxPromptChars)}\n\n[Content truncated for length.]` : documentText

  // Global Document Deduplication — checked before anything else. The
  // hash covers exactly the text that would be sent to the model, so a
  // hit here guarantees the cached analysis is the same analysis a fresh
  // call would have produced.
  const contentHash = computeDocumentContentHash(promptText)
  const cached = await getCachedAnalysis(contentHash, targetLanguage)
  if (cached) {
    void logTransformerCost({
      requestId,
      quantumDocumentId: null,
      modelId: cached.modelId,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - startedAt,
      success: true,
    })
    return { success: true, payload: cached.payload, modelId: cached.modelId }
  }

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
      // AI Cost Optimization™ — Prompt Caching. `cache_control` marks
      // this exact, always-identical instruction block as cacheable;
      // Anthropic caches it server-side and future calls (from any
      // student, within the cache window) reference it at a steep
      // discount instead of paying full input-token price again. Only
      // pays off once this block is large enough to clear Anthropic's
      // minimum cacheable-block size for this model — see this file's
      // own cost-log comment for why the actual saving is measured, not
      // just assumed.
      system: [{ type: 'text', text: QUANTUM_DOCUMENT_TRANSFORMER_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [
        { role: 'user', content: buildQuantumDocumentTransformerUserMessage(documentTitle, promptText, targetLanguage, targetQuestionCount, isMetadataOnly) },
      ],
    })

    const toolUseBlock = response.content.find((block) => block.type === 'tool_use')
    const processingTimeMs = Date.now() - startedAt
    const cacheReadTokens = response.usage.cache_read_input_tokens ?? 0
    const cacheWriteTokens = response.usage.cache_creation_input_tokens ?? 0

    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      void logTransformerCost({
        requestId,
        quantumDocumentId: null,
        modelId: MODEL,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens,
        cacheWriteTokens,
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
        cacheReadTokens,
        cacheWriteTokens,
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
      cacheReadTokens,
      cacheWriteTokens,
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

    // Global Document Deduplication — populate the cache for the NEXT
    // person who uploads this exact content. Best-effort: see
    // documentAnalysisCache.ts's own comment on why a write failure here
    // must never fail this already-successful request.
    void saveCachedAnalysis(contentHash, targetLanguage, payload, MODEL)

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
