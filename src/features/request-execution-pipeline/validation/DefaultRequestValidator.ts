import type { RequestEnvelope, RequestValidationIssue, RequestValidationResult } from '../types'
import type { RequestValidator } from './RequestValidator'

// Implements RequestValidator — "## Validation" (§ brief), verbatim,
// checked directly against the built envelope's own fields:
//
// - missing-provider: blank `context.providerId`.
// - missing-model: blank `context.modelId`.
// - invalid-prompt: blank/whitespace-only `payload.userPrompt` (the
//   mandatory field; `systemPrompt` may legitimately be absent).
// - empty-payload: BOTH `systemPrompt` and `userPrompt` blank — a
//   stronger condition than `invalid-prompt` alone; the two can and do
//   co-occur when the whole payload is empty.
// - invalid-metadata: any of `metadata.learnerId`/`profileId`/`source`/
//   `generatedAt` blank.
// - invalid-execution-context: blank `context.learnerId`/`profileId`
//   (distinct from the provider/model-specific checks above).
// - unsupported-configuration: `configuration.temperature` non-finite
//   or outside [0, 2]; `configuration.maxOutputTokens` non-finite or
//   <= 0.
export class DefaultRequestValidator implements RequestValidator {
  validate(envelope: RequestEnvelope): RequestValidationResult {
    const issues: RequestValidationIssue[] = []
    const { context, payload, metadata, configuration } = envelope

    if (!context.providerId.trim()) {
      issues.push({ type: 'missing-provider', detail: 'The request context has no provider id.' })
    }

    if (!context.modelId.trim()) {
      issues.push({ type: 'missing-model', detail: 'The request context has no model id.' })
    }

    if (!payload.userPrompt.trim()) {
      issues.push({ type: 'invalid-prompt', detail: 'The user prompt is empty.' })
    }

    if (!payload.systemPrompt.trim() && !payload.userPrompt.trim()) {
      issues.push({ type: 'empty-payload', detail: 'Both the system prompt and user prompt are empty.' })
    }

    if (!metadata.learnerId.trim() || !metadata.profileId.trim() || !metadata.source.trim() || !metadata.generatedAt.trim()) {
      issues.push({ type: 'invalid-metadata', detail: 'The request metadata has one or more empty fields.' })
    }

    if (!context.learnerId.trim() || !context.profileId.trim()) {
      issues.push({ type: 'invalid-execution-context', detail: 'The execution context has an empty learnerId or profileId.' })
    }

    if (!Number.isFinite(configuration.temperature) || configuration.temperature < 0 || configuration.temperature > 2) {
      issues.push({ type: 'unsupported-configuration', detail: `temperature ${configuration.temperature} must be a finite number between 0 and 2.` })
    }

    if (!Number.isFinite(configuration.maxOutputTokens) || configuration.maxOutputTokens <= 0) {
      issues.push({ type: 'unsupported-configuration', detail: `maxOutputTokens ${configuration.maxOutputTokens} must be a positive finite number.` })
    }

    return { valid: issues.length === 0, issues }
  }
}

export function createRequestValidator(): RequestValidator {
  return new DefaultRequestValidator()
}
