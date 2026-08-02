import type { RequestValidationResult } from './RequestValidationResult'

// Immutable — every field `readonly`. The brief's own "ExecutionDiagnostics"
// responsibility, renamed — a real, exact collision found via
// repo-wide grep with
// `personalization-engine/executionDiagnostics/ExecutionDiagnostics.ts`
// (an unrelated execution-*plan* concept). Renamed to echo this
// sprint's own feature name.
export type RequestExecutionDiagnostics = {
  readonly requestId: string
  readonly providerId: string
  readonly modelId: string
  readonly validationResult: RequestValidationResult
  readonly systemPromptLength: number
  readonly userPromptLength: number
  readonly normalizationApplied: boolean
}
