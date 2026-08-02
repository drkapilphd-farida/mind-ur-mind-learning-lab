// Immutable — every field `readonly`. Structural companion, not one of
// the brief's 5 named models — passed through from
// `provider-translation-engine`'s own `ProviderMessage` unchanged,
// independently declared per this feature's self-containment rule.
export type ProviderExecutionMessage = {
  readonly role: string
  readonly content: string
}
