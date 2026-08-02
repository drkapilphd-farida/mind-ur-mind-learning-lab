// AI Provider Layer™ Response Processing Pipeline (Sprint 40) — a new
// top-level sibling feature: the mirror-image inbound step to Sprint
// 39's Request Execution Pipeline — validates, normalizes, and
// processes an AI response after (deterministic, simulated) request
// execution. No real SDK calls, no streaming, no billing, no token
// accounting, no embeddings, no vector database, no conversation
// memory updates, no UI rendering — "Do NOT implement" list honored in
// full.
//
// One real naming collision on a brief-named responsibility:
// `PipelineResult` already exists at
// `request-execution-pipeline/types/PipelineResult.ts` (this session's
// own Sprint 39). Renamed to `ResponseProcessingResult`, echoing this
// sprint's own feature name. Three more collisions found among this
// plan's own supporting types (not brief-mandated) — all in the
// pre-existing `provider-response-pipeline` (Sprint 33):
// `RawProviderResponse`, `ResponseValidationIssue`,
// `ResponseValidationResult`. Named `RawResponsePayload`,
// `ResponseProcessingValidationIssue`, and
// `ResponseProcessingValidation` instead, sidestepping the collisions
// entirely. The other 9 brief-named responsibilities
// (`ResponseProcessingPipeline`, `ResponseEnvelope`, `ResponseValidator`,
// `ResponseNormalizer`, `ResponseMetadataExtractor`, `UsageExtractor`,
// `FinishReasonResolver`, `ErrorResponseMapper`, `ResponseDiagnostics`)
// had zero exact matches anywhere and are used brief-exact.
//
// Fully self-contained — zero cross-feature imports.
//
// `ResponseValidator` deliberately validates the *raw* payload, before
// extraction/normalization — several of the brief's own 7 validation
// concerns (`missing-usage`, `provider-error-payload`,
// `unsupported-finish-reason`) only make unambiguous sense against the
// raw shape (once `UsageExtractor` defaults a missing usage to
// `{0,0,0}`, a genuinely-missing usage becomes indistinguishable from
// a real zero-token response). `FinishReasonResolver` is injected into
// `ResponseValidator` so "is this raw value supported" isn't
// duplicated logic. `ResponseNormalizer` only ever runs on an
// already-valid raw response. `ResponseProcessingPipeline.process()`
// never throws — always a `ResponseProcessingResult`.

export * from './types'
export * from './finishReason'
export * from './metadata'
export * from './usage'
export * from './errorMapping'
export * from './validation'
export * from './normalization'
export * from './diagnostics'
export * from './pipeline'
