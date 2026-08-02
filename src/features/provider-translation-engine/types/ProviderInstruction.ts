// Immutable — every field `readonly`. Passed through from
// `MentorPromptInstruction` unchanged — `directive` is still a fixed
// deterministic slug, never a sentence.
export type ProviderInstruction = {
  readonly id: string
  readonly directive: string
}
