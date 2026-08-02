import type { MentorResponseMetadata } from './MentorResponseMetadata'
import type { MentorResponseSection } from './MentorResponseSection'

// Immutable — every field `readonly`. This engine's whole output —
// deliberately distinct from `@/features/ai-mentor`'s own
// `MentorUIResponse` (`ai-mentor/contracts/MentorResponseComposer.ts`):
// that type is one live conversation turn's reply + flat insight/
// recommendation arrays; this one is a structured, section/card/action
// bundle "ready for future LLM providers," produced from
// Personalization Engine™ data via `@/features/ai-mentor-personalization-bridge`,
// with no dependency on an active conversation. No literal name
// collision (`MentorResponse` is unused elsewhere, confirmed by
// repo-wide grep), so no rename was needed — unlike Sprints 26/28.
export type MentorResponse = {
  readonly id: string
  readonly version: number
  readonly sections: readonly MentorResponseSection[]
  readonly metadata: MentorResponseMetadata
}
