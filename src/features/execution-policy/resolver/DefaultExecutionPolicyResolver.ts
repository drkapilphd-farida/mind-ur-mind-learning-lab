import { createExecutionPolicyEngine } from '../engine'
import type { ExecutionPolicyConfig, ExecutionPolicyValidationIssue } from '../types'
import {
  validateCircularFallback,
  validateExecutionConstraints,
  validateFallbackPolicy,
  validateMissingPolicy,
  validateRetryPolicy,
  validateTimeoutPolicy,
} from '../validation'
import type { ExecutionPolicyResolution } from './ExecutionPolicyResolution'
import type { ExecutionPolicyResolver } from './ExecutionPolicyResolver'

// Implements ExecutionPolicyResolver — runs the 6 config-level
// validators ("Missing policy," "Invalid timeout," "Invalid retry
// count," "Invalid fallback," "Invalid constraint," "Circular
// fallback") and only constructs the engine when every one passes.
export class DefaultExecutionPolicyResolver implements ExecutionPolicyResolver {
  resolve(config: ExecutionPolicyConfig): ExecutionPolicyResolution {
    const issues: ExecutionPolicyValidationIssue[] = [
      ...validateMissingPolicy(config).issues,
      ...validateTimeoutPolicy(config.timeoutPolicy).issues,
      ...validateRetryPolicy(config.retryPolicy).issues,
      ...validateFallbackPolicy(config.fallbackPolicy).issues,
      ...validateExecutionConstraints(config.constraints).issues,
      ...validateCircularFallback(config.fallbackPolicy).issues,
    ]

    const validationResult = { valid: issues.length === 0, issues }

    if (!validationResult.valid) {
      return { engine: null, validationResult }
    }

    return { engine: createExecutionPolicyEngine(config), validationResult }
  }
}

export function createExecutionPolicyResolver(): ExecutionPolicyResolver {
  return new DefaultExecutionPolicyResolver()
}
