// A synthetic, local representation of Gemini's real generateContent
// response shape — same "not imported from anywhere" reasoning as
// `OpenAIRawResponse.ts`. Modeled on the well-known real shape
// (`candidates[].content.parts[].text`/`finishReason`,
// `usageMetadata.promptTokenCount`/`candidatesTokenCount`).
export type GeminiRawResponse = {
  readonly candidates: readonly {
    readonly content: { readonly parts: readonly { readonly text: string }[] }
    readonly finishReason: string
  }[]
  readonly usageMetadata: {
    readonly promptTokenCount: number
    readonly candidatesTokenCount: number
  }
}
