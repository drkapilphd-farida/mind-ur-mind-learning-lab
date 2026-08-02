// Immutable — every field `readonly`. Structural companion, not one of
// the brief's 5 named models — passed through from
// `provider-translation-engine`'s own `ProviderInstruction` unchanged,
// plus the `safety-baseline` instruction appended during configuration
// resolution (`../pipeline/resolveProviderConfiguration.ts`).
export type ProviderExecutionInstruction = {
  readonly id: string
  readonly directive: string
}
