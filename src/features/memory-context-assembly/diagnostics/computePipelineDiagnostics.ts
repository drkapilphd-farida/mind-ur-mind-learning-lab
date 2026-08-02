import type { ContextPackage } from '../domain'
import type { ContextValidationResult } from '../validation'
import type { PipelineDiagnostics } from './PipelineDiagnostics'

// Pure — assembled from values the pipeline already computed at each
// stage, never recomputed/re-derived here.
export function computePipelineDiagnostics(
  inputMemoryCount: number,
  selectedMemoryCount: number,
  contextPackage: ContextPackage,
  validationResult: ContextValidationResult,
): PipelineDiagnostics {
  const packagedMemoryCount = contextPackage.sections.reduce((total, section) => total + section.references.length, 0)

  return {
    inputMemoryCount,
    selectedMemoryCount,
    trimmedMemoryCount: selectedMemoryCount - packagedMemoryCount,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    packageVersion: contextPackage.metadata.version,
  }
}
