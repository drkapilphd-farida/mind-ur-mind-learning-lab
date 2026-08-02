import type { AIError } from '../types'

// Normalizes any raw thrown value (a known local error class, a plain
// Error, or something unrecognized) into a structured AIError — never
// a provider's own raw error shape. BaseProviderAdapter calls this
// exactly once per failure, in one place, so every caller gets a
// consistent, typed error regardless of what actually went wrong.
export interface ErrorTranslator {
  translate(error: unknown, providerId: string): AIError
}
