// "Validate: ExecutionRequest, ProviderConfig, ExecutionPolicy,
// RetryPolicy, CancellationPolicy, TimeoutPolicy" — the Sprint 35
// brief's own Validation list, verbatim.
export type ExecutionValidationIssueType =
  | 'invalid-execution-request'
  | 'invalid-provider-config'
  | 'invalid-execution-policy'
  | 'invalid-retry-policy'
  | 'invalid-cancellation-policy'
  | 'invalid-timeout-policy'

// Immutable — every field `readonly`.
export type ExecutionValidationIssue = {
  readonly type: ExecutionValidationIssueType
  readonly detail: string
}
