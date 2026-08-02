import type { ProviderExecutionResponse, ProviderResponseFinishReason } from '../types'
import type { AnthropicRawResponse } from './AnthropicRawResponse'
import type { ResponseNormalizationInputs } from './ResponseNormalizationInputs'

// Anthropic's own real stop-reason vocabulary, deterministically
// mapped to the unified `ProviderResponseFinishReason`. Unmapped
// values fall back to `'unknown'`.
const FINISH_REASON_MAP: Readonly<Record<string, ProviderResponseFinishReason>> = {
  end_turn: 'stop',
  stop_sequence: 'stop',
  max_tokens: 'length',
}

// Pure — Anthropic profile: "Schema translation only." Extracts text
// from the first content block and finish reason from `stop_reason`,
// and prompt/completion tokens from `usage` (Anthropic's own
// `input_tokens`/`output_tokens` naming).
export function normalizeAnthropicResponse(raw: AnthropicRawResponse, correlation: ResponseNormalizationInputs, now: string, id: string): ProviderExecutionResponse {
  const text = raw.content[0]?.text ?? ''
  const finishReason = FINISH_REASON_MAP[raw.stop_reason] ?? 'unknown'
  const promptTokens = raw.usage.input_tokens
  const completionTokens = raw.usage.output_tokens

  return {
    id,
    version: 1,
    providerId: 'anthropic',
    content: { text, finishReason },
    usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
    safetyFlags: finishReason === 'safety' ? ['content-filtered'] : [],
    metadata: { learnerId: correlation.learnerId, profileId: correlation.profileId, source: 'provider-response-pipeline', generatedAt: now },
  }
}
