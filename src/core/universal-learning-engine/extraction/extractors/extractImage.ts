import Anthropic from '@anthropic-ai/sdk'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { DEFAULT_MODEL_PRICING } from '@/core/ai-foundation/types/ModelPricing'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import type { ExtractionResult } from '../errors/ExtractionError'
import { buildUniversalLearningDocument } from '../services/buildUniversalLearningDocument'
import { normalizeContent } from '../services/normalizeContent'
import type { LearningSection } from '../types/UniversalLearningDocument'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_OUTPUT_TOKENS = 4096
const NO_TEXT_SENTINEL = 'NO_TEXT_FOUND'

export type ClaudeImageMediaType = 'image/png' | 'image/jpeg'

// Anthropic's Base64ImageSource only accepts jpeg/png/gif/webp — of the
// image formats this app's upload pipeline recognizes (jpeg/png/webp/heic/
// heif), only jpeg/png are the ones this feature was scoped to support, so
// anything else is an honest, disclosed gap rather than a silently broken
// upload.
export function toClaudeMediaType(mimeType: string): ClaudeImageMediaType | null {
  if (mimeType === 'image/png') return 'image/png'
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'image/jpeg'
  return null
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

type ClaudeVisionResult = { text: string }
export type CallClaudeVisionFn = (base64Data: string, mediaType: ClaudeImageMediaType) => Promise<ClaudeVisionResult>

// Same direct-Anthropic-bypass + manual ai_cost_log pattern already
// established by generateMentorReply.ts/generateQuantumDocumentIntelligence.ts
// — this is a real Claude vision call, not a deterministic parser like the
// other extractors in this folder, so its cost needs the same real
// observability.
async function logImageExtractionCost(entry: {
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
      feature: 'image-text-extraction',
      model_id: entry.modelId,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      estimated_cost_cents: estimatedCostCents,
      processing_time_ms: entry.processingTimeMs,
      request_id: entry.requestId,
      success: entry.success,
      error_message: entry.errorMessage ?? null,
    })
    if (error) logger.warn('failed to persist image extraction cost log entry', { error: error.message, requestId: entry.requestId })
  } catch (error) {
    logger.warn('failed to persist image extraction cost log entry', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}

// The real default: a single multimodal Claude message (the image + an
// instruction to transcribe it verbatim) — Claude already reads both
// printed and handwritten text reliably, so no separate OCR
// library/provider is needed. Throws on any failure (missing API key, no
// text block, network error); extractImage's own try/catch maps every
// throw to one honest, generic ExtractionError, the same boundary
// extractPDF.ts already uses for its own default extractor.
async function defaultCallClaudeVision(base64Data: string, mediaType: ClaudeImageMediaType): Promise<ClaudeVisionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('stub') || apiKey.includes('placeholder')) {
    throw new Error('Image text extraction is not configured yet.')
  }

  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            {
              type: 'text',
              text: `Transcribe every piece of text visible in this image exactly as written, including handwritten notes. Preserve paragraph breaks where they appear. Return ONLY the transcribed text — no commentary, no headers, no markdown formatting. If the image contains no readable text at all, respond with exactly: ${NO_TEXT_SENTINEL}`,
            },
          ],
        },
      ],
    })

    const processingTimeMs = Date.now() - startedAt
    const block = response.content.find((candidate) => candidate.type === 'text')

    if (!block || block.type !== 'text') {
      void logImageExtractionCost({ requestId, modelId: MODEL, inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens, processingTimeMs, success: false, errorMessage: 'Response contained no text block.' })
      throw new Error('Response contained no text block.')
    }

    void logImageExtractionCost({ requestId, modelId: MODEL, inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens, processingTimeMs, success: true })
    return { text: block.text.trim() }
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'Response contained no text block.') {
      void logImageExtractionCost({
        requestId,
        modelId: MODEL,
        inputTokens: 0,
        outputTokens: 0,
        processingTimeMs: Date.now() - startedAt,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error.',
      })
    }
    throw error
  }
}

// Universal Learning Intelligence Engine™ (ULIE™) — real image/handwritten-
// note extraction. The whole image becomes one heading-less section,
// mirroring extractTXT.ts's own "plain text has no structure to preserve"
// approach, since a photographed page/note has no machine-derived heading
// structure either. `callClaudeVision` defaults to the real Claude call
// (defaultCallClaudeVision); tests inject a fake, the same DI boundary
// extractPDF.ts already established for its own third-party dependency.
export async function extractImage(file: File, source: UniversalSource, callClaudeVision: CallClaudeVisionFn = defaultCallClaudeVision): Promise<ExtractionResult> {
  const mediaType = toClaudeMediaType(file.type)
  if (!mediaType) {
    return { success: false, error: { code: 'unsupported-encoding', message: 'This image format is not supported yet — please upload a PNG or JPEG.' } }
  }

  let transcribedText: string
  try {
    const base64Data = await fileToBase64(file)
    const result = await callClaudeVision(base64Data, mediaType)
    transcribedText = result.text
  } catch {
    return { success: false, error: { code: 'extraction-failed', message: 'We could not read the text in this image. Please try again.' } }
  }

  if (transcribedText === NO_TEXT_SENTINEL) {
    return { success: false, error: { code: 'empty-extraction', message: 'No readable text was found in this image.' } }
  }

  const normalized = normalizeContent(transcribedText)
  if (normalized.paragraphs.length === 0) {
    return { success: false, error: { code: 'empty-extraction', message: 'No readable text was found in this image.' } }
  }

  const sections: readonly LearningSection[] = [
    { id: 'section-0', heading: null, blocks: normalized.paragraphs.map((text) => ({ type: 'paragraph' as const, text })) },
  ]

  const document = buildUniversalLearningDocument(source, source.name, sections, normalized.paragraphs, normalized.content, null, {
    extraMetadata: { extractionMethod: 'claude-vision' },
  })
  return { success: true, document }
}
