import type { MentorPromptSectionType } from './MentorPromptSectionType'

// Renamed from the brief's own "PromptSection" — that exact name
// already exists at `@/features/ai-intelligence-layer/types/PromptSection.ts`,
// a `{title, content}` string-pair holding *natural-language prose*
// (its own `formatContextSections.ts` writes sentences like
// "Learner: X (Y, prefers Z)."). Different feature, different shape,
// and critically a different philosophy than this sprint's "No
// natural-language generation" constraint — so renamed rather than
// reused, same fix as `MentorContext`→`MentorPersonalizationContext`
// (Sprint 28). `values` is `readonly string[]`, never a `content:
// string` — structurally prevents prose from creeping in, same
// discipline as `MentorResponseCard.values` (Sprint 29).
export type MentorPromptSection = {
  readonly type: MentorPromptSectionType
  readonly values: readonly string[]
}
