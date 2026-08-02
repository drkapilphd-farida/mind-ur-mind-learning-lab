import type { FailureCategory, FailureSignal } from '../types'
import type { FailureClassifier } from './FailureClassifier'

const KNOWN_ERROR_CODES: Record<string, FailureCategory> = {
  rate_limited: 'rate-limit',
  provider_unavailable: 'provider-unavailable',
  transient_error: 'transient-provider-failure',
  retry_exhausted: 'retry-exhaustion',
}

export class DefaultFailureClassifier implements FailureClassifier {
  classify(signal: FailureSignal): FailureCategory {
    if (signal.timedOut) return 'timeout'
    if (signal.errorCode === null) return 'unknown'
    return KNOWN_ERROR_CODES[signal.errorCode] ?? 'unknown'
  }
}

export function createFailureClassifier(): FailureClassifier {
  return new DefaultFailureClassifier()
}
