import type { AIError } from '../types'

// Thrown by BaseProviderAdapter.generate()/estimateCost() for every
// failure — lifecycle, model selection, capability validation, or
// execute() itself — after ErrorTranslator has normalized the raw
// cause into a structured AIError. Callers catch this one error type
// and read `.aiError` rather than needing to know every possible
// underlying error class.
export class ProviderAdapterError extends Error {
  readonly aiError: AIError

  constructor(aiError: AIError) {
    super(aiError.message)
    this.name = 'ProviderAdapterError'
    this.aiError = aiError
  }
}
