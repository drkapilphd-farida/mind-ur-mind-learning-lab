import type { TimeoutResolutionPolicy } from '../types'
import type { TimeoutResolutionDecision } from './TimeoutResolutionDecision'

// Pure — "timeout resolution" (§ Responsibilities), brief-verbatim.
// `elapsedMs` is caller-supplied and deterministic — no actual timers,
// no real measurement.
export function resolveTimeout(elapsedMs: number, policy: TimeoutResolutionPolicy): TimeoutResolutionDecision {
  const remainingMs = Math.max(policy.deadlineMs - elapsedMs, 0)
  const expired = elapsedMs >= policy.deadlineMs

  return {
    expired,
    remainingMs,
    reason: expired ? `Elapsed ${elapsedMs}ms reached the configured deadline of ${policy.deadlineMs}ms.` : null,
  }
}
