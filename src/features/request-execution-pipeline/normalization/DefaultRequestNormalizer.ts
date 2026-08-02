import type { RequestEnvelope } from '../types'
import type { RequestNormalizer } from './RequestNormalizer'

// Pure — trims leading/trailing whitespace from `systemPrompt`/
// `userPrompt`. Deterministic; no lossy rewriting of prompt content.
export class DefaultRequestNormalizer implements RequestNormalizer {
  normalize(envelope: RequestEnvelope): RequestEnvelope {
    return {
      ...envelope,
      payload: { systemPrompt: envelope.payload.systemPrompt.trim(), userPrompt: envelope.payload.userPrompt.trim() },
    }
  }
}

export function createRequestNormalizer(): RequestNormalizer {
  return new DefaultRequestNormalizer()
}
