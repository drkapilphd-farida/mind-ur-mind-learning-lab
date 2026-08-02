// A synthetic, local representation of OpenAI's real Chat Completions
// response shape — not imported from anywhere, since no real or mock
// provider call happens anywhere in this whole arc ("No provider
// execution" has held at every step from Sprint 31 onward). Modeled on
// the well-known real shape (`choices[].message.content`/
// `finish_reason`, `usage.prompt_tokens`/`completion_tokens`) purely
// so `normalizeOpenAIResponse.ts` has a genuine schema to translate.
export type OpenAIRawResponse = {
  readonly choices: readonly {
    readonly message: { readonly content: string }
    readonly finish_reason: string
  }[]
  readonly usage: {
    readonly prompt_tokens: number
    readonly completion_tokens: number
  }
}
