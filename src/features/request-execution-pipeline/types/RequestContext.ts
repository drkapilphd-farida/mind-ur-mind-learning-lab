// Immutable — every field `readonly`. The "Execution Context"
// dimension (§ brief) — "Selected Provider"/"Selected Model" are plain
// `string`s here, self-contained (never imported from
// `provider-selection-engine`/`model-selection-engine`).
export type RequestContext = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerId: string
  readonly modelId: string
}
