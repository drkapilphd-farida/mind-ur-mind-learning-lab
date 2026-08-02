import type { ProviderAdapterValidationIssue } from './ProviderAdapterValidationIssue'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities ("ProviderAdapterValidation") — the shared result
// wrapper every validator in `../validation/` returns.
export type ProviderAdapterValidation = {
  readonly valid: boolean
  readonly issues: readonly ProviderAdapterValidationIssue[]
}
