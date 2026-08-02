import type { ResponseEnvelope } from '../types'

// One of the brief's own 10 named responsibilities — "Normalized
// response generation" (§ brief). Only ever applied to an
// already-valid raw response — see
// `../pipeline/DefaultResponseProcessingPipeline.ts`.
export interface ResponseNormalizer {
  normalize(envelope: ResponseEnvelope): ResponseEnvelope
}
