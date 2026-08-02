import type { FinishReason } from '../types'

// One of the brief's own 10 named responsibilities. Resolves a raw,
// provider-supplied finish-reason string into the normalized
// `FinishReason` vocabulary. Injected into `../validation/`'s
// `ResponseValidator` so "is this raw value supported" isn't
// duplicated logic.
export interface FinishReasonResolver {
  resolve(raw: string | null): FinishReason
}
