import { validateAdapterExecutionRequest, validateAdapterResponse } from '../validation'
import type {
  AdapterProviderId,
  ProviderAdapterExecutionRequest,
  ProviderAdapterExecutionResult,
  ProviderAdapterMetadata,
  ProviderAdapterNormalizedResponse,
  ProviderAdapterPayload,
  ProviderAdapterRawResponse,
  ProviderAdapterTransformedRequest,
  ProviderAdapterValidation,
} from '../types'
import type { DeterministicProviderAdapter } from './DeterministicProviderAdapter'

// One generic, metadata-driven implementation — "deterministic adapter
// definitions for" the 6 supported providers means 6 sets of *data*
// (`ProviderAdapterMetadata`), not 6 near-duplicate classes. Every
// method below is driven entirely by the metadata this instance was
// constructed with plus the given input — no per-provider
// special-casing, no SDKs, no network calls.
export class DefaultProviderAdapter implements DeterministicProviderAdapter {
  readonly providerId: AdapterProviderId

  constructor(readonly metadata: ProviderAdapterMetadata) {
    this.providerId = metadata.providerId
  }

  validateRequest(request: ProviderAdapterExecutionRequest): ProviderAdapterValidation {
    return validateAdapterExecutionRequest(request)
  }

  transformExecutionRequest(request: ProviderAdapterExecutionRequest): ProviderAdapterTransformedRequest {
    return {
      providerId: this.providerId,
      messageCount: request.messageCount,
      instructionCount: request.instructionCount,
      payloadSummary: request.payloadSummary,
    }
  }

  buildProviderPayload(transformed: ProviderAdapterTransformedRequest): ProviderAdapterPayload {
    return {
      providerId: transformed.providerId,
      model: this.metadata.supportedModels[0] ?? '',
      messageCount: transformed.messageCount,
      instructionCount: transformed.instructionCount,
      payloadSummary: transformed.payloadSummary,
      configuration: this.metadata.defaultConfiguration,
    }
  }

  normalizeProviderResponse(raw: ProviderAdapterRawResponse): ProviderAdapterNormalizedResponse {
    return { providerId: raw.providerId, text: raw.outputText, finishReason: raw.finishReason, modelUsed: raw.modelUsed }
  }

  validateProviderResponse(response: ProviderAdapterNormalizedResponse): ProviderAdapterValidation {
    return validateAdapterResponse(response)
  }

  buildExecutionResult(response: ProviderAdapterNormalizedResponse, sessionId: string): ProviderAdapterExecutionResult {
    return { sessionId, succeeded: response.finishReason === 'stop', outputText: response.text, finishReason: response.finishReason }
  }
}
