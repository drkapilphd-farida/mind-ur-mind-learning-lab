// A synthetic, local representation of Anthropic's real Messages API
// response shape — same "not imported from anywhere" reasoning as
// `OpenAIRawResponse.ts`. Modeled on the well-known real shape
// (`content[].text`, `stop_reason`, `usage.input_tokens`/`output_tokens`).
export type AnthropicRawResponse = {
  readonly content: readonly { readonly text: string }[]
  readonly stop_reason: string
  readonly usage: {
    readonly input_tokens: number
    readonly output_tokens: number
  }
}
