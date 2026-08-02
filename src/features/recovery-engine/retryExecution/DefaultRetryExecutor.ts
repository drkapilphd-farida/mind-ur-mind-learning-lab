import type { RecoveryPlan, RetryExecutionResult, RetryOutcome } from '../types'
import type { RetryExecutor } from './RetryExecutor'

export class DefaultRetryExecutor implements RetryExecutor {
  execute(plan: RecoveryPlan, outcome: RetryOutcome): RetryExecutionResult {
    if (plan.strategy === 'abort-execution') {
      return { executed: false, plan, succeeded: false, responseText: null }
    }

    return { executed: true, plan, succeeded: outcome.succeeded, responseText: outcome.responseText }
  }
}

export function createRetryExecutor(): RetryExecutor {
  return new DefaultRetryExecutor()
}
