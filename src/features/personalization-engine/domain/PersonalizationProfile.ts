import type { PersonalizationLifecycleState } from './PersonalizationLifecycleState'
import type { PersonalizationMetadata } from './PersonalizationMetadata'
import type { PersonalizationRule } from './PersonalizationRule'

// The core immutable domain model — every field `readonly`. Never
// mutated in place anywhere in this feature; every transformation
// (lifecycle transition, rule change) returns a *new* PersonalizationProfile
// value. Pure TypeScript, no framework dependency.
export type PersonalizationProfile = {
  readonly id: string
  readonly lifecycle: PersonalizationLifecycleState
  readonly rules: readonly PersonalizationRule[]
  readonly metadata: PersonalizationMetadata
  readonly createdAt: string
  readonly updatedAt: string
}
