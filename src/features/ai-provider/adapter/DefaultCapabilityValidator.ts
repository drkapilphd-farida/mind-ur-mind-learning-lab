import type { AIModel, AIRequest } from '../types'
import type { CapabilityValidator } from '../contracts'
import { estimateTokens } from '../adapters'
import { InvalidRequestError } from './InvalidRequestError'

// Implements CapabilityValidator against a model's real, already-typed
// limits — no empty messages, requested maxOutputTokens not exceeding
// the model's own maxOutputTokens, estimated input tokens (via Chunk
// 1's estimateTokens — "no duplicated logic") not exceeding the
// model's contextWindowTokens. Every check here is a genuine,
// catchable mistake, never a stand-in for "not implemented yet."
export class DefaultCapabilityValidator implements CapabilityValidator {
  validate(model: AIModel, request: AIRequest): void {
    if (request.messages.length === 0) {
      throw new InvalidRequestError('AIRequest.messages must not be empty')
    }

    if (request.maxOutputTokens !== undefined && request.maxOutputTokens > model.maxOutputTokens) {
      throw new InvalidRequestError(`requested maxOutputTokens (${request.maxOutputTokens}) exceeds model "${model.id}"'s maxOutputTokens (${model.maxOutputTokens})`)
    }

    const estimatedInputTokens = request.messages.reduce((sum, message) => sum + estimateTokens(message.content), 0)
    if (estimatedInputTokens > model.contextWindowTokens) {
      throw new InvalidRequestError(`estimated input tokens (${estimatedInputTokens}) exceed model "${model.id}"'s contextWindowTokens (${model.contextWindowTokens})`)
    }
  }
}

export function createCapabilityValidator(): CapabilityValidator {
  return new DefaultCapabilityValidator()
}
