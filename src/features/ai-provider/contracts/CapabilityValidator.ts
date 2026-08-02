import type { AIModel, AIRequest } from '../types'

// Validates one already-selected model against a specific request's
// real limits (no empty messages, requested maxOutputTokens not
// exceeding the model's own maxOutputTokens, estimated input tokens not
// exceeding the model's contextWindowTokens) — distinct from Chunk 2's
// CapabilityResolver, which picks a *provider* by capability flags
// before any model is selected. Throws (never returns a boolean) so
// BaseProviderAdapter's single try/catch + ErrorTranslator handles
// every failure mode the same way.
export interface CapabilityValidator {
  validate(model: AIModel, request: AIRequest): void
}
