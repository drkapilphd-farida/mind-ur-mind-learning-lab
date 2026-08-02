// Memory Context Assembly Pipeline™ (Sprint 21) — deterministic
// pipeline that transforms stored memories into immutable
// `ContextPackage`s "ready for future AI consumption," without
// invoking any AI provider itself.
//
// This is the one Memory Engine feature in this whole session that
// deliberately imports read-only from other Memory Engine features —
// `@/features/memory-persistence` (query/filter infrastructure,
// retention eligibility) and `@/features/memory-session-context`
// (session context rules) — because this sprint's own brief calls for
// it explicitly and repeatedly: "Applies existing query/filter
// infrastructure... Applies retention eligibility... Applies session
// context rules... Reuse existing infrastructure wherever possible."
// This mirrors the earlier `ai-mentor-provider-bridge` precedent (a
// dedicated bridge feature importing two others read-only) rather than
// Sprints 15/18/20's self-contained pattern, whose briefs never named
// a specific existing engine to reuse this concretely. Nothing in
// either imported feature is modified; both remain fully unaware this
// feature exists.
//
// No LLM prompt generation, no token counting, no AI ranking, no
// embeddings — "Do NOT implement" list honored in full.

export * from './domain'
export * from './contracts'
export * from './adapters'
export * from './prioritization'
export * from './sizeManagement'
export * from './validation'
export * from './diagnostics'
export * from './assembly'
