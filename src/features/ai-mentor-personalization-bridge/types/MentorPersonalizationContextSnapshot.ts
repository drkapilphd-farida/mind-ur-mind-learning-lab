import type { MentorContextMetadata } from './MentorContextMetadata'
import type { MentorPersonalizationContext } from './MentorPersonalizationContext'

// Immutable — every field `readonly`. Named `MentorPersonalizationContextSnapshot`,
// not the brief's own literal "MentorContextSnapshot," for naming
// consistency with `MentorPersonalizationContext`'s own rename (see
// that file's comment for why). "Produce immutable output" (§5) — this
// feature's whole output, one snapshot per orchestration run.
export type MentorPersonalizationContextSnapshot = {
  readonly id: string
  readonly version: number
  readonly context: MentorPersonalizationContext
  readonly metadata: MentorContextMetadata
}
