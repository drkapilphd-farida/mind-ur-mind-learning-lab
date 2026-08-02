// Memory Prompt Context Adapter™ (Sprint 22) — deterministic,
// provider-neutral transformation of `ContextPackage` values into
// immutable `ContextPayload`s "ready for future AI providers," without
// generating prompts, formatting LLM messages, or calling any AI
// service itself.
//
// Deliberately imports read-only from `@/features/memory-context-assembly`
// (`ContextPackage`, `ContextPriority`, `ContextSizeLimits`) and
// `@/features/memory-persistence` (`MemoryId`) — this sprint's own
// checklist explicitly permits it: "No cross-feature imports beyond
// approved Memory Engine modules," a deliberate loosening from every
// earlier sprint's unqualified wording, and Section 2 names the exact
// thing to transform ("Transform ContextPackage"). Neither imported
// feature is modified or made aware this feature exists.
//
// No prompt generation, no LLM message formatting, no
// OpenAI/Anthropic/Gemini adapters, no token counting — "Do NOT
// implement" list honored in full.

export * from './domain'
export * from './contracts'
export * from './adapters'
export * from './transformation'
export * from './validation'
export * from './serialization'
export * from './diagnostics'
export * from './orchestration'
