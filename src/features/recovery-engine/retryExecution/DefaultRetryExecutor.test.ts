import { describe, expect, it } from 'vitest'
import { createRetryExecutor } from './DefaultRetryExecutor'
import { makeRecoveryPlan, makeRetryOutcome } from '../testFixtures'

describe('DefaultRetryExecutor (Retry Execution)', () => {
  it('reports the caller-supplied outcome for a non-abort plan', () => {
    const executor = createRetryExecutor()
    const plan = makeRecoveryPlan({ strategy: 'retry-same-provider' })
    const outcome = makeRetryOutcome({ succeeded: true, responseText: 'Recovered!' })

    const result = executor.execute(plan, outcome)

    expect(result).toEqual({ executed: true, plan, succeeded: true, responseText: 'Recovered!' })
  })

  it('reports a failed outcome faithfully', () => {
    const executor = createRetryExecutor()
    const plan = makeRecoveryPlan({ strategy: 'execute-fallback' })
    const outcome = makeRetryOutcome({ succeeded: false, responseText: null })

    const result = executor.execute(plan, outcome)

    expect(result).toEqual({ executed: true, plan, succeeded: false, responseText: null })
  })

  it('never executes an abort-execution plan, regardless of the supplied outcome', () => {
    const executor = createRetryExecutor()
    const plan = makeRecoveryPlan({ strategy: 'abort-execution' })
    const outcome = makeRetryOutcome({ succeeded: true, responseText: 'This should be ignored.' })

    const result = executor.execute(plan, outcome)

    expect(result).toEqual({ executed: false, plan, succeeded: false, responseText: null })
  })
})
