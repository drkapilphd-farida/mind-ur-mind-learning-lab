// Immutable — every field `readonly`. "Source package version, Payload
// version, Section count, Reference count, Validation status,
// Transformation duration (deterministic measurement)... Diagnostics
// only" — never used to drive transformation behavior, only observed.
// `transformationDurationMs` is deterministic in the sense that it's
// always computed the same way (end-timestamp minus start-timestamp,
// both from the same injected Clock) — genuinely testable with a fixed
// or sequential test clock, even though real elapsed wall-clock time
// itself can never be deterministic.
export type AdapterDiagnostics = {
  readonly sourcePackageVersion: number
  readonly payloadVersion: number
  readonly sectionCount: number
  readonly referenceCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly transformationDurationMs: number
}
