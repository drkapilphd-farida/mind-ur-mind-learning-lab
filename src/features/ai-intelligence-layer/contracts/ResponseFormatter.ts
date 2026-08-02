import type { FormattedResponse, RawAIResponseInput } from '../types'

// "Normalize every provider response into one common structure...
// Mock only." No real provider response has ever existed yet
// (Sprint 5's AI Provider Layer is mock-only too) — this formatter
// operates purely on RawAIResponseInput's plain-text/structured-extras
// shape, deterministic text classification only, never invented content.
export interface ResponseFormatter {
  format(raw: RawAIResponseInput): FormattedResponse
}
