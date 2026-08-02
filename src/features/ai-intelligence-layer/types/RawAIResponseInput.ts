// The Response Formatter's™ input — deliberately its own local shape,
// not imported from `@/features/ai-provider/types`'s AIResponse
// ("AI Provider Layer" is in Sprint 7's DO NOT MODIFY list, and this
// layer stays "Future Provider Agnostic" — coupling to one provider
// layer's exact response shape would defeat that). `content` is the
// only field every provider response is guaranteed to have; `cards`/
// `suggestedExerciseIds` are optional structured extras a real
// provider integration could attach alongside free text, never parsed
// out of it.
export type RawAIResponseInput = {
  content: string
  cards?: readonly { title: string; body: string }[]
  suggestedExerciseIds?: readonly string[]
}
