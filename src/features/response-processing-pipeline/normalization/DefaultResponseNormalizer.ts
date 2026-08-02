import type { ResponseEnvelope } from '../types'
import type { ResponseNormalizer } from './ResponseNormalizer'

// Pure — trims leading/trailing whitespace from `content`.
// Deterministic; no lossy rewriting of response content.
export class DefaultResponseNormalizer implements ResponseNormalizer {
  normalize(envelope: ResponseEnvelope): ResponseEnvelope {
    return { ...envelope, content: envelope.content.trim() }
  }
}

export function createResponseNormalizer(): ResponseNormalizer {
  return new DefaultResponseNormalizer()
}
