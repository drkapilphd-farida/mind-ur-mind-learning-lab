// Immutable — every field `readonly`. A provider's deterministic
// "Default Configuration" (§ Adapter Metadata) — no API keys, no
// per-request overrides, just the two settings a real call would
// eventually need.
export type ProviderAdapterConfiguration = {
  readonly temperature: number
  readonly maxOutputTokens: number
}
