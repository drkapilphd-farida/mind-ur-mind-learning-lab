import type { RawResponsePayload, ResponseProcessingValidation } from '../types'

// One of the brief's own 10 named responsibilities — "Handle" (§
// Validation): checks the *raw* payload, before any extraction/
// normalization. Pure; never throws.
export interface ResponseValidator {
  validate(raw: RawResponsePayload): ResponseProcessingValidation
}
