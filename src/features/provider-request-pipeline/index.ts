// AI Provider Layer™ Provider Request Pipeline (Sprint 32) — a new
// top-level sibling feature, one-way reader of
// `@/features/provider-translation-engine` and `@/features/ai-provider`,
// never the other way around. Second sprint in this run to touch the
// *real*, pre-existing `ai-provider` infrastructure (Sprint 5).
//
// "Configuration Resolution" (§3) is deliberately a small, fixed,
// in-code catalog (`pipeline/PROVIDER_CONFIGURATION_CATALOG.ts`), not
// `@/features/ai-provider`'s own live-registry resolution machinery:
// `ai-provider/contracts/ProviderResolver.ts`/`ProviderFactory.ts`/
// `ModelSelectionStrategy.ts` all select from a real, live registry of
// `AIProvider` instances and throw `NoMatchingProviderError` on no
// match — that's runtime provider selection paired with real
// execution, exactly what "No provider execution" / "Configuration
// only" rules out here.
//
// The one genuine `ai-provider` integration point is
// `integration/toAIRequestOptions.ts`: a compile-time-only
// `Pick<AIRequest, 'temperature' | 'maxOutputTokens'>` mapper proving
// this feature's own `ProviderExecutionOptions` is shaped exactly like
// `AIRequest`'s own optional fields — same "not runtime-wired, a
// compile-time compatibility proof" framing as
// `@/features/provider-translation-engine/integration/PROVIDER_ROLE_MAP.ts`.
//
// Cross-feature imports are confined to `integration/` — the *only*
// files here that import `@/features/provider-translation-engine` or
// `@/features/ai-provider`. `types/`, `pipeline/`, `validation/`,
// `diagnostics/`, and `orchestration/` internals are all fully
// self-contained. No HTTP clients, no API calls, no streaming, no
// token counting, no LLM execution, no embeddings, no semantic search,
// no UI — "Do NOT implement" list honored in full.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './integration'
export * from './pipeline'
export * from './validation'
export * from './diagnostics'
export * from './orchestration'
