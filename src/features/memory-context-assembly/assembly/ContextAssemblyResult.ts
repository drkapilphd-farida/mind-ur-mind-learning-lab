import type { ContextPackage } from '../domain'
import type { PipelineDiagnostics } from '../diagnostics'
import type { ContextValidationResult } from '../validation'

// Immutable — every field `readonly`. What one pipeline run produces:
// the package itself, its validation outcome, and its diagnostics —
// all three always returned together so a caller never has to
// re-derive one from the others.
export type ContextAssemblyResult = {
  readonly contextPackage: ContextPackage
  readonly validationResult: ContextValidationResult
  readonly diagnostics: PipelineDiagnostics
}
