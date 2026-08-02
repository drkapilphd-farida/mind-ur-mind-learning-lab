// AI Mentor™ Response Composition Engine (Sprint 29) — a standalone
// sibling feature to `@/features/ai-mentor-personalization-bridge`
// (Sprint 28), same shape and posture: "its own bounded context," one-way
// reader of `@/features/ai-mentor-personalization-bridge` and
// `@/features/personalization-engine`, never the other way around.
//
// Deliberately distinct from the *existing* `@/features/ai-mentor`'s
// own `MentorResponseComposer`/`MentorUIResponse`
// (`ai-mentor/contracts/MentorResponseComposer.ts`) — that composer
// shapes one live conversation turn's reply from `ai-mentor`'s own
// native `MentorContext`; this engine composes a structured,
// section/card/action bundle "ready for future LLM providers" from
// Personalization Engine™ data, with no dependency on an active
// conversation. No literal name collided (confirmed via repo-wide grep
// for `MentorResponse`/`MentorResponseSection`/`MentorResponseCard`/
// `MentorAction`/`MentorResponseMetadata` — all clear), so unlike
// Sprints 26/28 no rename was needed. `ai-mentor` itself is never
// imported — this sprint is producer-only, same posture as Sprint 28;
// wiring either of these into `ai-mentor`'s live pipeline is later,
// explicitly-scoped work.
//
// Cross-feature imports are confined to `integration/` — the *only*
// files here that import `@/features/ai-mentor-personalization-bridge`
// or `@/features/personalization-engine`. `types/`, `composition/`,
// `validation/`, `diagnostics/`, and `orchestration/` internals are all
// fully self-contained. No AI provider calls, no ML, no prompt
// generation, no LLM message formatting, no token counting, no
// streaming, no embeddings, no semantic search, no UI — "Do NOT
// implement" list honored in full.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './integration'
export * from './composition'
export * from './validation'
export * from './diagnostics'
export * from './orchestration'
