import type { ProviderExecutionResponse, ProviderResponseFinishReason } from '../types'
import type { GeminiRawResponse } from './GeminiRawResponse'
import type { ResponseNormalizationInputs } from './ResponseNormalizationInputs'

// Gemini's own real finish-reason vocabulary, deterministically mapped
// to the unified `ProviderResponseFinishReason`. Unmapped values fall
// back to `'unknown'`.
const FINISH_REASON_MAP: Readonly<Record<string, ProviderResponseFinishReason>> = {
  STOP: 'stop',
  MAX_TOKENS: 'length',
  SAFETY: 'safety',
}

// Pure — Gemini profile: "Schema translation only." Extracts text from
// the first candidate's first part and finish reason from that
// candidate's own `finishReason`, and prompt/completion tokens from
// `usageMetadata` (Gemini's own `promptTokenCount`/`candidatesTokenCount`
// naming).
export function normalizeGeminiResponse(raw: GeminiRawResponse, correlation: ResponseNormalizationInputs, now: string, id: string): ProviderExecutionResponse {
  const candidate = raw.candidates[0]
  const text = candidate?.content.parts[0]?.text ?? ''
  const finishReason = FINISH_REASON_MAP[candidate?.finishReason ?? ''] ?? 'unknown'
  const promptTokens = raw.usageMetadata.promptTokenCount
  const completionTokens = raw.usageMetadata.candidatesTokenCount

  return {
    id,
    version: 1,
    providerId: 'gemini',
    content: { text, finishReason },
    usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
    safetyFlags: finishReason === 'safety' ? ['content-filtered'] : [],
    metadata: { learnerId: correlation.learnerId, profileId: correlation.profileId, source: 'provider-response-pipeline', generatedAt: now },
  }
}
