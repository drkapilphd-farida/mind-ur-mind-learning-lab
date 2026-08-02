// Immutable — every field `readonly`. "Input memory count, Selected
// memory count, Trimmed memory count, Validation status, Package
// version... Diagnostics only" — never used to drive pipeline
// behavior, only observed.
export type PipelineDiagnostics = {
  readonly inputMemoryCount: number
  readonly selectedMemoryCount: number
  readonly trimmedMemoryCount: number
  readonly validationStatus: 'valid' | 'invalid'
  readonly packageVersion: number
}
