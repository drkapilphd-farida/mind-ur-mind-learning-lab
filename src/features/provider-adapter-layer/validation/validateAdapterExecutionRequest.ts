import type { ProviderAdapterExecutionRequest, ProviderAdapterValidation, ProviderAdapterValidationIssue } from '../types'

// Pure — "Validate: ExecutionRequest ... Reject invalid execution
// before runtime." Checks the incoming request itself is well-formed:
// blank id, negative message/instruction counts.
export function validateAdapterExecutionRequest(request: ProviderAdapterExecutionRequest): ProviderAdapterValidation {
  const issues: ProviderAdapterValidationIssue[] = []

  if (!request.id.trim()) {
    issues.push({ type: 'invalid-execution-request', detail: 'The execution request has an empty id.' })
  }

  if (request.messageCount < 0) {
    issues.push({ type: 'invalid-execution-request', detail: `messageCount ${request.messageCount} cannot be negative.` })
  }

  if (request.instructionCount < 0) {
    issues.push({ type: 'invalid-execution-request', detail: `instructionCount ${request.instructionCount} cannot be negative.` })
  }

  return { valid: issues.length === 0, issues }
}
