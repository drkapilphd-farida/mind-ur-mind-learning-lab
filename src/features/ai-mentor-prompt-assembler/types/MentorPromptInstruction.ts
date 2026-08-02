// Renamed from the brief's own "PromptInstruction" for family-naming
// consistency with `MentorPromptSection`'s own collision-driven rename.
// `directive` is a fixed, deterministic slug drawn from a small
// in-code catalog (`../assembly/assembleMentorPromptPayload.ts`) —
// a tag a future, out-of-scope prompt-generation step would translate
// into real instruction text, never a sentence itself ("No
// natural-language generation").
export type MentorPromptInstruction = {
  readonly id: string
  readonly directive: string
}
