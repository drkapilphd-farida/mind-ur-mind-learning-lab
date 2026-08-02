import type { AIFoundationResult } from './types/AIFoundationResult'
import type { AITask } from './types/AITask'

// AI Foundation Layer™ — shared per-call timeout for an
// `AIFoundation.execute()` call. Generalizes Semantic Enrichment
// Engine™ (UCE-3B)'s own private `withTimeout` (which stays exactly as
// it was, hardcoded to the `'semantic-enrichment'` task) so the Learning
// Knowledge Graph™ (UCE-4) and AI Learning Analysis Engine™ (UCE-5)
// AI-derived call sites — previously unbounded — get the same real
// "never hangs forever" guarantee, parameterized by whichever `AITask`
// they actually call. `execute()` itself is documented to always resolve
// (never reject) with a Result-type value, so only a `.then` handler is
// needed here — no defensive catch for a contract AIFoundation already
// guarantees.
export function withExecuteTimeout(promise: Promise<AIFoundationResult>, task: AITask, timeoutMs: number, requestId: string, now: () => Date = () => new Date()): Promise<AIFoundationResult> {
  const startedAt = now().getTime()

  return new Promise((resolve) => {
    let settled = false

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve({
        success: false,
        task,
        requestId,
        error: { code: 'timeout', message: `${task} request exceeded ${timeoutMs}ms.`, providerId: 'ai-foundation', retryable: true },
        processingTimeMs: now().getTime() - startedAt,
      })
    }, timeoutMs)

    void promise.then((result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    })
  })
}
