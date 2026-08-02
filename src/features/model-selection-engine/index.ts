// AI Provider Layer™ Model Registry & Model Selection Engine
// (Sprint 38) — a new top-level sibling feature: decides *which
// model* to use once a provider has already been selected
// (`provider-selection-engine`, Sprint 37), via a deterministic
// catalog + registry + a two-tier selection engine (strict default,
// relaxed fallback), structurally mirroring that sprint's own
// architecture. No SDKs, no network calls, no API keys, no streaming,
// no token counting, no billing, no embeddings, no vector database, no
// prompt execution, no LLM inference — "Do NOT implement" list honored
// in full.
//
// Zero naming collisions found via repo-wide grep on all 10 of the
// brief's own named responsibilities (`ModelRegistry`, `ModelCatalog`,
// `ModelSelectionEngine`, `ModelPriorityResolver`,
// `ModelCapabilityResolver`, `DefaultModelResolver`,
// `FallbackModelResolver`, `ModelAvailabilityState`, `ModelMetadata`,
// `ModelSelectionDiagnostics`) — every one used brief-exact, no renames
// needed this sprint (unlike Sprints 36/37, which each had 1-2 real
// collisions with the pre-existing `ai-provider` feature).
//
// Fully self-contained — zero cross-feature imports. `providerId` on
// `ModelMetadata`/`ModelSelectionRequest` is a plain `string` (not
// imported from `provider-selection-engine`'s `SelectionProviderId`)
// — same "self-contained mirror, not a shared type" discipline as
// every prior sprint's cross-sprint-adjacent concepts. `ModelCapability`
// independently re-declares the same 7-capability vocabulary this
// whole arc has used since Sprint 36.
//
// `catalog/` is fixed, in-code seed data (`ModelCatalog`); `registry/`
// is the mutable runtime store (`ModelRegistry`) — two distinct
// responsibilities per the brief's own separate bullets.
// `resolution/`'s `DefaultModelResolver` (strict) and
// `FallbackModelResolver` (relaxed) both implement one small,
// non-brief-named shared interface (`ModelSelectionResolver`) so
// `ModelSelectionEngine` can try one, then the other, uniformly — both
// scoped to the request's own `providerId` only, since this sprint
// picks a model *for* an already-chosen provider and never switches
// providers. Never throws; an unresolvable request is
// `resolutionPath: 'none'` data.

export * from './types'
export * from './catalog'
export * from './validation'
export * from './priority'
export * from './capability'
export * from './registry'
export * from './resolution'
export * from './engine'
export * from './diagnostics'
