// AI Provider Layer™ Provider Translation Engine (Sprint 31) — a new
// top-level sibling feature, one-way reader of
// `@/features/ai-mentor-prompt-assembler` and `@/features/ai-provider`,
// never the other way around. First sprint in this run to touch the
// *real*, pre-existing `ai-provider` infrastructure (Sprint 5) rather
// than staying purely within the `ai-mentor-*` family.
//
// Deliberately distinct from three existing, adjacent features
// (confirmed via a read-only research pass, not assumed):
// - `@/features/ai-provider`'s own `RequestMapper` seam
//   (`AIRequest → MappedProviderRequest`) operates one layer
//   downstream (from `AIRequest`, not `MentorPromptPayload`) and is
//   explicitly paired with real provider execution — this engine never
//   produces an `AIRequest` and never executes anything.
// - `@/features/ai-provider-configuration` is a provider-id/capability
//   catalog, not a translator — not one of this sprint's 3 allowed
//   integrations, so not imported.
// - `@/features/real-ai-providers` makes real network calls and
//   actually *skips* genuine per-provider schema translation (it
//   flattens then re-wraps as one message) — the opposite of "Only
//   schema translation. No API implementation."
//
// The one genuine `ai-provider` integration point is
// `integration/PROVIDER_ROLE_MAP.ts`: a `Record<ProviderMessageRole,
// AIRequestRole>` proving every role this engine emits is a real,
// valid `ai-provider` role — the same seam
// `@/features/ai-mentor-provider-bridge/mapMentorPromptToAIRequest.ts`
// already established for the older `MentorPrompt` pipeline.
//
// The 3 provider profiles (OpenAI/Anthropic/Gemini) are differentiated
// by one real, well-known, deterministic schema fact: Anthropic's
// Messages API doesn't accept a `system`-role message in the array
// (folded into `context.facts` instead); early Gemini generations
// don't support a `system` role at all (mapped to `user` instead).
//
// Cross-feature imports are confined to `integration/` — the *only*
// files here that import `@/features/ai-mentor-prompt-assembler` or
// `@/features/ai-provider`. `types/`, `translation/`, `validation/`,
// `diagnostics/`, and `orchestration/` internals are all fully
// self-contained. No API calls, no HTTP clients, no streaming, no
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
