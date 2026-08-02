// "## Validation" (§ brief) — the 6 named concerns, verbatim: Execution
// Request, Provider Configuration, Adapter Registration, Capability
// Compatibility, Request Structure, Response Structure.
export type ProviderAdapterValidationIssueType =
  | 'invalid-execution-request'
  | 'invalid-provider-configuration'
  | 'invalid-adapter-registration'
  | 'incompatible-capability'
  | 'invalid-request-structure'
  | 'invalid-response-structure'

// Immutable — every field `readonly`.
export type ProviderAdapterValidationIssue = {
  readonly type: ProviderAdapterValidationIssueType
  readonly detail: string
}
