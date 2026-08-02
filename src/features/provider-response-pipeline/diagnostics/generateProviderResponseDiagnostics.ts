import type { ProviderExecutionResponse, ProviderResponseDiagnostics } from '../types'
import type { ResponseValidationResult } from '../validation'

// Pure — "Generate diagnostics." `responseCompleteness` compares 2
// presence checks (non-blank `content.text`, `usage.totalTokens > 0`):
// both present → `complete`, neither → `empty`, otherwise `partial`.
export function generateProviderResponseDiagnostics(response: ProviderExecutionResponse, validationResult: ResponseValidationResult): ProviderResponseDiagnostics {
  const presentCount = [response.content.text.trim().length > 0, response.usage.totalTokens > 0].filter(Boolean).length
  const responseCompleteness = presentCount === 2 ? 'complete' : presentCount === 0 ? 'empty' : 'partial'

  return {
    responseCompleteness,
    providerProfile: response.providerId,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    responseVersion: response.version,
  }
}
