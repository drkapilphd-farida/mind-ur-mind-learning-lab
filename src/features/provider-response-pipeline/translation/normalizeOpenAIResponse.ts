import type { ProviderExecutionResponse, ProviderResponseFinishReason } from '../types'
import type { OpenAIRawResponse } from './OpenAIRawResponse'
import type { ResponseNormalizationInputs } from './ResponseNormalizationInputs'

// OpenAI's own real finish-reason vocabulary, deterministically mapped
// to the unified `ProviderResponseFinishReason` — table lookup, never
// generated text. Unmapped values fall back to `'unknown'`.
const FINISH_REASON_MAP: Readonly<Record<string, ProviderResponseFinishReason>> = {
  stop: 'stop',
  length: 'length',
  content_filter: 'safety',
}

// Pure — OpenAI profile: "Schema translation only." Extracts text and
// finish reason from the first choice, and prompt/completion tokens
// from `usage`.
export function normalizeOpenAIResponse(raw: OpenAIRawResponse, correlation: ResponseNormalizationInputs, now: string, id: string): ProviderExecutionResponse {
  const choice = raw.choices[0]
  const text = choice?.message.content ?? ''
  const finishReason = FINISH_REASON_MAP[choice?.finish_reason ?? ''] ?? 'unknown'
  const promptTokens = raw.usage.prompt_tokens
  const completionTokens = raw.usage.completion_tokens

  return {
    id,
    version: 1,
    providerId: 'openai',
    content: { text, finishReason },
    usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
    safetyFlags: finishReason === 'safety' ? ['content-filtered'] : [],
    metadata: { learnerId: correlation.learnerId, profileId: correlation.profileId, source: 'provider-response-pipeline', generatedAt: now },
  }
}
