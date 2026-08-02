// Immutable — every field `readonly`. The "System Prompt"/"User
// Prompt" selection dimensions (§ brief) bundled as one payload —
// "Prompt Payload" (§ brief). `userPrompt` is mandatory in spirit
// (checked by `../validation/`'s `invalid-prompt`); `systemPrompt` may
// legitimately be blank for some request types.
export type PromptPayload = {
  readonly systemPrompt: string
  readonly userPrompt: string
}
