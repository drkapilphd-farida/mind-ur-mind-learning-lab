import type { ContextPayload } from '../domain'
import type { PayloadValidationResult } from '../validation'
import type { AdapterDiagnostics } from './AdapterDiagnostics'

// Pure — assembled from values already computed by the transformation
// and validation steps, plus the two timestamps bracketing the
// transformation itself.
export function computeAdapterDiagnostics(
  payload: ContextPayload,
  sourcePackageVersion: number,
  validationResult: PayloadValidationResult,
  transformationStartedAt: string,
  transformationFinishedAt: string,
): AdapterDiagnostics {
  const referenceCount = payload.sections.reduce((total, section) => total + section.references.length, 0)

  return {
    sourcePackageVersion,
    payloadVersion: payload.metadata.payloadVersion,
    sectionCount: payload.sections.length,
    referenceCount,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    transformationDurationMs: Date.parse(transformationFinishedAt) - Date.parse(transformationStartedAt),
  }
}
