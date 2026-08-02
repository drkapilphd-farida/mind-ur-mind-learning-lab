import type { RequestEnvelope } from '../types'

// One of the brief's own 10 named responsibilities. Only ever applied
// to an already-valid envelope — see `../pipeline/DefaultRequestExecutionPipeline.ts`.
export interface RequestNormalizer {
  normalize(envelope: RequestEnvelope): RequestEnvelope
}
