// AI Provider Layer™ Provider Response Pipeline (Sprint 33) — a new
// top-level sibling feature, one-way reader of
// `@/features/provider-request-pipeline` and `@/features/ai-provider`,
// never the other way around. The response-side mirror of Sprints
// 31-32's request-side arc.
//
// The 3 raw response shapes this feature translates
// (`translation/OpenAIRawResponse.ts`/`AnthropicRawResponse.ts`/
// `GeminiRawResponse.ts`) are synthetic and local — not imported from
// anywhere — because no real or mock provider call happens anywhere in
// this whole arc ("No provider execution" has held at every step since
// Sprint 31). They model each real provider's own well-known response
// schema (OpenAI's `choices[].message.content`/`finish_reason`;
// Anthropic's `content[].text`/`stop_reason`; Gemini's
// `candidates[].content.parts[].text`/`finishReason`) purely so the 3
// normalizer functions have a genuine per-provider schema to translate
// from — same "Schema translation only" discipline as
// `provider-translation-engine`'s own request-side profiles.
//
// The one genuine `ai-provider` integration point is
// `integration/toTokenUsage.ts`: a compile-time-only
// `ProviderUsageStatistics → TokenUsage` mapper proving this feature's
// usage shape aligns field-for-field with `ai-provider`'s own, same
// "not runtime-wired, a compile-time compatibility proof" framing as
// `provider-translation-engine/integration/PROVIDER_ROLE_MAP.ts` and
// `provider-request-pipeline/integration/toAIRequestOptions.ts`.
//
// Cross-feature imports are confined to `integration/` — the *only*
// files here that import `@/features/provider-request-pipeline` or
// `@/features/ai-provider`. `types/`, `translation/`, `validation/`,
// `diagnostics/`, and `orchestration/` internals are all fully
// self-contained. No HTTP clients, no API calls, no streaming, no
// token counting, no LLM execution, no embeddings, no semantic search,
// no UI — "Do NOT implement" list honored in full.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './integration'
export * from './translation'
export * from './validation'
export * from './diagnostics'
export * from './orchestration'
