// Real AI Integration™ AI Orchestration Pipeline (Sprint 34) — the
// end-to-end coordinator for the entire arc built across Sprints 23-33.
// Calls all 6 downstream orchestrators' own real
// `create*OrchestrationService().generate()` factories in sequence —
// `ai-mentor-personalization-bridge` → `ai-mentor-response-composer` →
// `ai-mentor-prompt-assembler` → `provider-translation-engine` →
// `provider-request-pipeline` → `provider-response-pipeline` — "No
// business logic duplication": this feature never recomputes anything
// those services already do, it only threads their real outputs into
// each next stage's own real input shape. "AI Memory Engine™",
// "Personalization Engine™", and "Adaptive Learning Planner™" are
// coordinated by feeding their already-computed objects into the
// bridge call (Sprint 28's own seam) — never recomputed here, never
// called a second time. "Production AI Mentor™" (the original
// `ai-mentor` feature) is not imported — same producer-only posture
// every `ai-mentor-*` sprint already established.
//
// No real provider call anywhere — the "Response Normalized" stage is
// fed a deterministic *synthetic* raw response
// (`integration/buildSyntheticRawResponse.ts`), echoing the execution
// request's own messages back, shaped per that provider's own raw
// schema. Same "no network call anywhere in this arc" posture Sprint
// 33 already established, extended one layer further.
//
// Two deliberate, documented exceptions to conventions held since
// Sprint 23:
// 1. `types/AIOrchestrationContext.ts`/`AIOrchestrationResult.ts` stay
//    self-contained (per the rule every sprint has followed) by
//    carrying flat summaries (`completedStages`, extracted
//    `responseText`/`providerId` strings) rather than the real
//    cross-feature payload objects, which only ever exist transiently
//    inside `orchestration/DefaultAIOrchestrationService.ts` during one
//    run.
// 2. `orchestration/DefaultAIOrchestrationService.ts` is the one file
//    in this whole session permitted to import multiple other
//    features' factory functions directly (not just their types) —
//    "coordinating existing components" is this sprint's entire
//    purpose, so calling them is business logic, not a violation of
//    the "integration/ only" import-confinement rule (which still
//    holds for every *type-only* cross-feature reference).
//
// No HTTP clients, no API calls, no streaming, no token counting, no
// embeddings, no semantic search, no UI, no Intelligence Lab
// integrations — "Do NOT implement" list honored in full.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './pipeline'
export * from './integration'
export * from './validation'
export * from './diagnostics'
export * from './orchestration'
