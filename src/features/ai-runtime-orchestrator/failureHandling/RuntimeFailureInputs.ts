import type { RuntimeExecutionContext, RuntimeValidationIssueType } from '../types'

// Immutable — every field `readonly`. `RuntimeFailureHandler.handle()`'s
// own input.
export type RuntimeFailureInputs = {
  readonly context: RuntimeExecutionContext
  readonly issueType: RuntimeValidationIssueType
  readonly detail: string
  readonly selectedProviderId: string | null
  readonly selectedModelId: string | null
}
