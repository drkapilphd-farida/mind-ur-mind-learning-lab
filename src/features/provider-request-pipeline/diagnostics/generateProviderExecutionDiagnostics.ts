import type { ProviderExecutionDiagnostics, ProviderExecutionRequest } from '../types'
import type { PipelineValidationResult } from '../validation'

// Pure — "Generate diagnostics." `requestCompleteness` compares 3
// presence checks (non-blank `modelId`, non-empty `messages`,
// non-empty `context.facts`): all present → `complete`, none →
// `empty`, otherwise `partial`.
export function generateProviderExecutionDiagnostics(request: ProviderExecutionRequest, validationResult: PipelineValidationResult): ProviderExecutionDiagnostics {
  const presentCount = [request.modelId.trim().length > 0, request.messages.length > 0, request.context.facts.length > 0].filter(Boolean).length
  const requestCompleteness = presentCount === 3 ? 'complete' : presentCount === 0 ? 'empty' : 'partial'

  return {
    requestCompleteness,
    providerProfile: request.providerId,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    configurationVersion: request.version,
  }
}
