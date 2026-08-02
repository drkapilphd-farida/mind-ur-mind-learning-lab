// The result of validating an AIProviderConfiguration or an AIProvider
// itself (see contracts/ProviderValidator.ts) — a flat pass/fail plus
// every reason, never just a boolean, so a caller can surface exactly
// what's wrong rather than a generic "invalid."
export type ValidationResult = {
  valid: boolean
  errors: readonly string[]
}
