import type { RequestEnvelope, RequestValidationResult } from '../types'

// One of the brief's own 10 named responsibilities — "Handle" (§
// Validation): checks a fully-built `RequestEnvelope`. Pure; never
// throws.
export interface RequestValidator {
  validate(envelope: RequestEnvelope): RequestValidationResult
}
