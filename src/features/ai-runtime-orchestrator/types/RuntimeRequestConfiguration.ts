// Self-contained mirror of `request-execution-pipeline`'s own
// `RequestConfiguration` — same literal shape, never imported
// cross-feature.
export type RuntimeRequestConfiguration = {
  readonly temperature: number
  readonly maxOutputTokens: number
}
