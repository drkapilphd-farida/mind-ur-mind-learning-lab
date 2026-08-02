import type { RequestEnvelope, RequestExecutionDiagnostics, RequestValidationResult } from '../types'

// Pure — collects: Request Id, Provider, Model, Validation Result,
// System/User Prompt Length, Normalization Applied.
export function generateRequestExecutionDiagnostics(envelope: RequestEnvelope, validationResult: RequestValidationResult, normalizationApplied: boolean): RequestExecutionDiagnostics {
  return {
    requestId: envelope.id,
    providerId: envelope.context.providerId,
    modelId: envelope.context.modelId,
    validationResult,
    systemPromptLength: envelope.payload.systemPrompt.length,
    userPromptLength: envelope.payload.userPrompt.length,
    normalizationApplied,
  }
}
