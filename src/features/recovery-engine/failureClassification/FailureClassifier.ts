import type { FailureCategory, FailureSignal } from '../types'

// One of the brief's own 10 named responsibilities. Pure — maps a
// deterministic, caller-supplied `FailureSignal` to one
// `FailureCategory`.
export interface FailureClassifier {
  classify(signal: FailureSignal): FailureCategory
}
