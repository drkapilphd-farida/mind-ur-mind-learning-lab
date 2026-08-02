import type { FinishReasonResolver } from '../finishReason'
import type { RawResponsePayload, ResponseProcessingValidationIssue, ResponseProcessingValidation } from '../types'
import type { ResponseValidator } from './ResponseValidator'

// Implements ResponseValidator — "## Validation" (§ brief), verbatim,
// checked directly against the raw payload's own fields:
//
// - empty-response: ALL of content/finishReason/usage/metadata/
//   errorPayload are null (the provider returned nothing at all) — a
//   strict superset trigger; most of the checks below also fire when
//   this one does.
// - invalid-response: blank `providerId`.
// - missing-content: `content` is null or blank/whitespace.
// - invalid-metadata: `metadata` is null, or its `modelUsed`/
//   `requestId` is blank.
// - missing-usage: `usage` is null.
// - unsupported-finish-reason: the injected `FinishReasonResolver`
//   resolves `finishReason` to `'unknown'` (covers both a genuinely
//   unrecognized raw string and a null raw value).
// - provider-error-payload: `errorPayload` is not null — the one case
//   where *having* a value is itself the flagged condition.
export class DefaultResponseValidator implements ResponseValidator {
  constructor(private readonly finishReasonResolver: FinishReasonResolver) {}

  validate(raw: RawResponsePayload): ResponseProcessingValidation {
    const issues: ResponseProcessingValidationIssue[] = []

    if (raw.content === null && raw.finishReason === null && raw.usage === null && raw.metadata === null && raw.errorPayload === null) {
      issues.push({ type: 'empty-response', detail: 'The raw response has no content, finish reason, usage, metadata, or error payload at all.' })
    }

    if (!raw.providerId.trim()) {
      issues.push({ type: 'invalid-response', detail: 'The raw response has an empty providerId.' })
    }

    if (raw.content === null || !raw.content.trim()) {
      issues.push({ type: 'missing-content', detail: 'The raw response has no content.' })
    }

    if (raw.metadata === null || !raw.metadata.modelUsed.trim() || !raw.metadata.requestId.trim()) {
      issues.push({ type: 'invalid-metadata', detail: 'The raw response metadata is missing or has an empty modelUsed/requestId.' })
    }

    if (raw.usage === null) {
      issues.push({ type: 'missing-usage', detail: 'The raw response has no usage payload.' })
    }

    if (this.finishReasonResolver.resolve(raw.finishReason) === 'unknown') {
      issues.push({ type: 'unsupported-finish-reason', detail: `finishReason "${raw.finishReason}" is not a supported value.` })
    }

    if (raw.errorPayload !== null) {
      issues.push({ type: 'provider-error-payload', detail: `The raw response carries a provider error: "${raw.errorPayload.code}".` })
    }

    return { valid: issues.length === 0, issues }
  }
}

export function createResponseValidator(finishReasonResolver: FinishReasonResolver): ResponseValidator {
  return new DefaultResponseValidator(finishReasonResolver)
}
