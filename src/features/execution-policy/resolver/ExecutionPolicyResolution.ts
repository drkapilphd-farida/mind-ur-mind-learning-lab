import type { ExecutionPolicyValidation } from '../types'
import type { ExecutionPolicyEngine } from '../engine'

// Immutable — every field `readonly`. `ExecutionPolicyResolver.resolve()`'s
// own output — `engine` is `null` whenever `validationResult.valid`
// is `false`.
export type ExecutionPolicyResolution = {
  readonly engine: ExecutionPolicyEngine | null
  readonly validationResult: ExecutionPolicyValidation
}
