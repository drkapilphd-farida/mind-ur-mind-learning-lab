// AI Provider Layer™ Provider Registry & Selection Engine (Sprint 37)
// — a new top-level sibling feature: decides *which* provider to use,
// via a deterministic catalog + registry + a two-tier selection engine
// (strict default, relaxed fallback). No SDKs, no network calls, no
// API keys, no streaming, no token counting, no billing, no
// embeddings, no vector database — "Do NOT implement" list honored in
// full.
//
// Two real naming collisions found via repo-wide grep, both in the
// pre-existing `ai-provider` feature (Sprint 5):
// - `ProviderRegistry` — `ai-provider/contracts/ProviderRegistry.ts`
//   (a different registry, storing real `AIProvider` instances).
//   Renamed to `ProviderSelectionRegistry`, echoing this sprint's own
//   brief title ("Provider Registry & Selection Engine").
// - `DefaultProviderResolver` — `ai-provider/resolution/DefaultProviderResolver.ts`
//   (a different resolver, working over `AIProvider`/
//   `ProviderSelectionCriteria`). Renamed to
//   `DefaultProviderSelectionResolver`.
// `FallbackProviderResolver`, `ProviderCatalog`, `ProviderSelectionEngine`,
// `ProviderPriorityResolver`, `ProviderCapabilityResolver`,
// `ProviderAvailabilityState`, `ProviderSelectionDiagnostics` all had
// zero exact matches anywhere and are used brief-exact. This plan's own
// supporting input type is named `ProviderSelectionRequest` rather than
// "ProviderSelectionCriteria" specifically to sidestep a third,
// non-brief-mandated collision with `ai-provider/types/ProviderSelectionCriteria.ts`
// (a different shape).
//
// Fully self-contained — zero cross-feature imports. The brief names
// no upstream feature to bridge from (unlike Sprint 35/36's explicit
// bridging language), so this sprint needs no `integration/` folder at
// all. Its own `SelectionProviderId`/`SelectionCapability` unions
// independently re-declare the same 6 providers / 7 capabilities
// `provider-adapter-layer` (Sprint 36) already established as this
// arc's real-world vocabulary — same literal values, never a shared
// import, matching every prior sprint's "self-contained mirror" posture.
//
// `catalog/` is fixed, in-code seed data (`ProviderCatalog`);
// `registry/` is the mutable runtime store (`ProviderSelectionRegistry`)
// — two distinct responsibilities per the brief's own separate bullets.
// `resolution/`'s `DefaultProviderSelectionResolver` (strict) and
// `FallbackProviderResolver` (relaxed) both implement one small,
// non-brief-named shared interface (`ProviderSelectionResolver`) so
// `ProviderSelectionEngine` can try one, then the other, uniformly —
// never throwing; an unresolvable request is `resolutionPath: 'none'`
// data.

export * from './types'
export * from './catalog'
export * from './validation'
export * from './priority'
export * from './capability'
export * from './registry'
export * from './resolution'
export * from './engine'
export * from './diagnostics'
