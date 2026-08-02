import type { AdaptationMetadata } from './AdaptationMetadata'
import type { AdaptationResult } from './AdaptationResult'

// Immutable — every field `readonly`. The Adaptation Engine's™ whole
// output — one result per evaluated rule (5, fixed).
export type PersonalizationAdaptation = {
  readonly id: string
  readonly version: number
  readonly profileId: string
  readonly results: readonly AdaptationResult[]
  readonly metadata: AdaptationMetadata
}
