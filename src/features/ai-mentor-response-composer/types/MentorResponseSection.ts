import type { MentorAction } from './MentorAction'
import type { MentorResponseCard } from './MentorResponseCard'
import type { MentorResponseSectionType } from './MentorResponseSectionType'

// Immutable — every field `readonly`. One named section — always
// present (never omitted), though its `cards`/`actions` may both be
// empty when there's nothing to say.
export type MentorResponseSection = {
  readonly type: MentorResponseSectionType
  readonly cards: readonly MentorResponseCard[]
  readonly actions: readonly MentorAction[]
}
