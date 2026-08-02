// Renamed from the brief's own "PromptContext" for family-naming
// consistency with `MentorPromptSection`'s own collision-driven rename.
// A flat, self-contained snapshot of the facts every section is built
// from.
export type MentorPromptContext = {
  readonly learnerId: string
  readonly profileId: string
  readonly profileLifecycle: string
  readonly currentJourney: string | null
  readonly difficultyLevel: string | null
}
