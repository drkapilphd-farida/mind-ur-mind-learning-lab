// AI Provider Layer™ Provider Adapter Layer (Sprint 36) — a new
// top-level sibling feature, the next purely architectural step
// downstream of `@/features/provider-execution-engine` (Sprint 35):
// "bridges the internal Provider Execution Engine to future external
// AI providers." This sprint implements only the adapter abstraction
// and deterministic adapter infrastructure — no SDKs, no network
// calls, no API keys, no streaming, no token counting, no billing, no
// embeddings, no vector database, no caching, no retries, no execution
// logic, no conversation memory, no prompt generation, no provider
// authentication — "Do NOT implement" list honored in full.
//
// One real naming collision found via repo-wide grep, on the brief's
// own "ProviderAdapter" name — it collides *twice*:
// - `ai-provider/contracts/ProviderAdapter.ts` — the real, pre-existing
//   (Sprint 5) contract (`extends AIProvider`, `initialize/shutdown/
//   isReady`).
// - `ai-mentor/contracts/ProviderAdapter.ts` — a separate, mentor-
//   conversation-specific contract (`generateReply`).
// Renamed to `DeterministicProviderAdapter`, echoing the brief's own
// repeated language ("deterministic adapter infrastructure/
// definitions/methods/factory selection/metadata"). `DefaultProviderAdapter`
// (the brief's own exact name, zero collisions) is the one concrete,
// metadata-driven implementation. The other 9 brief-named identifiers
// (`ProviderAdapterFactory`, `ProviderAdapterRegistry`,
// `ProviderAdapterResolver`, `ProviderAdapterCapabilities`,
// `ProviderAdapterMetadata`, `ProviderAdapterValidation`,
// `ProviderAdapterDiagnostics`, `ProviderAdapterException`) had zero
// exact matches anywhere and are used brief-exact.
//
// Fully self-contained — never imports `ai-provider`,
// `ai-provider-configuration`, `real-ai-providers`, `ai-mentor`,
// `provider-request-pipeline`, or `provider-response-pipeline` (all
// either regression-protected or a different, real-execution concern).
// `definitions/PROVIDER_ADAPTER_DEFINITIONS.ts` is a brand-new,
// deterministic 6-provider catalog (openai/anthropic/gemini/grok/
// deepseek/local-llm) — same "configuration only, deliberately not
// `ai-provider`'s own live registry" discipline as
// `provider-request-pipeline/pipeline/PROVIDER_CONFIGURATION_CATALOG.ts`
// already set in this codebase.
//
// Cross-feature imports are confined to `integration/` and
// `testFixtures.ts` — the *only* places that import
// `@/features/provider-execution-engine` (`adaptExecutionRequest.ts`
// reduces its `ExecutionRequest` into this feature's own self-contained
// `ProviderAdapterExecutionRequest`). `types/`, `definitions/`,
// `capabilities/`, `validation/`, `diagnostics/`, and `orchestration/`
// internals never import it directly.

export * from './types'
export * from './definitions'
export * from './capabilities'
export * from './validation'
export * from './diagnostics'
export * from './integration'
export * from './orchestration'
