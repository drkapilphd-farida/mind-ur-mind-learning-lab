// Immutable — every field `readonly`. The "Configuration" selection
// dimension (§ brief) — deterministic, no API keys: whether this
// provider is enabled at all, and a fixed rate ceiling.
export type ProviderSelectionConfiguration = {
  readonly enabled: boolean
  readonly maxRequestsPerMinute: number
}
