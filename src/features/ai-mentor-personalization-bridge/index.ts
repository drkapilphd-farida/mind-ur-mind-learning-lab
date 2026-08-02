// AI Mentor™ Personalization Integration Layer (Sprint 28) — a
// standalone bridge feature, same shape as `@/features/ai-mentor-provider-bridge`:
// "its own bounded context, not part of" any of the features it reads
// from (`@/features/personalization-engine`, `@/features/ai-memory-engine`),
// one-way (this feature depends on them, they never depend on it).
// `@/features/adaptive-learning-planner`'s contribution is already
// carried inside `PersonalizationExecutionPlan`, so it's never imported
// directly. The existing `@/features/ai-mentor` is not imported either
// — this sprint is producer-only, building the bridge value object
// without modifying `ai-mentor`'s own `MentorPipelineInput` signature
// (a later, explicitly-scoped sprint is the wiring point).
//
// Two of the brief's own domain model names collided with unrelated,
// already-existing types (`MentorContext` — the conversation/insight
// bundle at `@/features/ai-mentor/types/context.ts` — and, for naming
// consistency, its sibling `MentorContextSnapshot`) and were renamed to
// `MentorPersonalizationContext`/`MentorPersonalizationContextSnapshot`
// — see `types/MentorPersonalizationContext.ts` for the full reasoning.
//
// Cross-feature imports are confined to `integration/` — the *only*
// files in this feature that import `@/features/personalization-engine`
// or `@/features/ai-memory-engine`. `types/`, `contextAssembly/`,
// `validation/`, `diagnostics/`, and `orchestration/` internals are all
// fully self-contained. No AI provider calls, no ML, no prompt
// generation, no LLM message formatting, no embeddings, no semantic
// search, no UI — "Do NOT implement" list honored in full.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './integration'
export * from './contextAssembly'
export * from './validation'
export * from './diagnostics'
export * from './orchestration'
