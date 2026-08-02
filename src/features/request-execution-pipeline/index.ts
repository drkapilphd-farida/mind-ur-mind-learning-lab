// AI Provider Layer™ Request Execution Pipeline (Sprint 39) — a new
// top-level sibling feature: assembles, validates, and normalizes the
// actual AI request (prompt payload, metadata, configuration, safety
// configuration, execution context) once a provider and model are
// already chosen (`provider-selection-engine` Sprint 37,
// `model-selection-engine` Sprint 38). No SDKs, no network calls, no
// streaming, no token counting, no billing, no embeddings, no vector
// database, no response parsing, no LLM execution — "Do NOT implement"
// list honored in full.
//
// One real naming collision found via repo-wide grep: `ExecutionDiagnostics`
// already exists at
// `personalization-engine/executionDiagnostics/ExecutionDiagnostics.ts`
// (Sprint 25 — an unrelated execution-*plan* concept). Renamed to
// `RequestExecutionDiagnostics`, echoing this sprint's own feature
// name. The other 9 brief-named responsibilities
// (`RequestExecutionPipeline`, `RequestContext`, `RequestEnvelope`,
// `ExecutionRequestBuilder`, `ExecutionContextResolver`,
// `RequestValidator`, `RequestNormalizer`, `RequestMetadataAssembler`,
// `PipelineResult`) had zero exact matches anywhere and are used
// brief-exact.
//
// Fully self-contained — zero cross-feature imports.
// `providerId`/`modelId` on `RequestContext` are plain `string`s —
// never imported from `provider-selection-engine`/
// `model-selection-engine`, same "self-contained mirror" discipline as
// every prior sprint's cross-sprint-adjacent concepts.
//
// The first sprint since 35 with a genuine, load-bearing need for
// `Clock`/`IdGenerator` (`RequestMetadataAssembler`'s `generatedAt`,
// `RequestEnvelope`'s own `id`) — own `contracts/`/`adapters/`, not
// shared with any other feature.
//
// `ExecutionRequestBuilder` is a pure, non-validating assembler — even
// a completely blank/malformed input still produces a `RequestEnvelope`.
// `RequestValidator` is the single place all 7 "## Validation" (§
// brief) concerns are checked, against the fully-built envelope.
// `RequestNormalizer` only ever runs when the envelope is already
// valid. `RequestExecutionPipeline.execute()` never throws — always a
// `PipelineResult`.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './context'
export * from './metadata'
export * from './validation'
export * from './normalization'
export * from './builder'
export * from './diagnostics'
export * from './pipeline'
