// Immutable — every field `readonly`. The "Configuration" selection
// dimension (§ brief) — deterministic, no API keys.
export type RequestConfiguration = {
  readonly temperature: number
  readonly maxOutputTokens: number
}
