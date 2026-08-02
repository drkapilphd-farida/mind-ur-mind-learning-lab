// Immutable — every field `readonly`. "Runtime options" (§3), resolved
// deterministically per provider profile
// (`../pipeline/PROVIDER_CONFIGURATION_CATALOG.ts`). Shaped to match
// `@/features/ai-provider/types`'s own `AIRequest`'s optional
// `temperature`/`maxOutputTokens` fields exactly — see
// `../integration/toAIRequestOptions.ts` for the checked compatibility
// seam.
export type ProviderExecutionOptions = {
  readonly temperature: number
  readonly maxOutputTokens: number
}
