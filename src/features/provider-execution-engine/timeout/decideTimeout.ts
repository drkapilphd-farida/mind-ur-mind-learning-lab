import type { ExecutionTimeoutPolicy } from '../types'
import type { TimeoutDecision } from './TimeoutDecision'

// Pure — "Implement Execution Deadline, Timeout Decision, Remaining
// Budget, Timeout Result ... No actual timers." `elapsedMs` is a
// deterministic, caller-supplied value — this function never measures
// real time, it only compares two given numbers.
export function decideTimeout(elapsedMs: number, policy: ExecutionTimeoutPolicy): TimeoutDecision {
  const remainingBudgetMs = Math.max(policy.deadlineMs - elapsedMs, 0)
  const timedOut = elapsedMs >= policy.deadlineMs

  return {
    timedOut,
    remainingBudgetMs,
    reason: timedOut ? `Elapsed ${elapsedMs}ms reached or exceeded the ${policy.deadlineMs}ms deadline.` : null,
  }
}
