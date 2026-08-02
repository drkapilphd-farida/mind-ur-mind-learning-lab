// Renamed from the brief's own "PromptMetadata" — no literal collision,
// but kept consistent with `MentorPromptSection`/`MentorPromptContext`/
// `MentorPromptInstruction`'s own collision-driven renames (see
// `MentorPromptSection.ts`) and forecloses an easy future collision
// (a generic name another feature could plausibly claim). Same
// `learnerId`/`profileId`/`source`/`generatedAt` convention as every
// prior engine's metadata type this session.
export type MentorPromptMetadata = {
  readonly learnerId: string
  readonly profileId: string
  readonly source: string
  readonly generatedAt: string
}
