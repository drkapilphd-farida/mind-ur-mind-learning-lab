// Immutable — every field `readonly`. The "Configuration" selection
// dimension (§ brief) — deterministic, no API keys.
export type ModelSelectionConfiguration = {
  readonly enabled: boolean
  readonly maxRequestsPerMinute: number
}
