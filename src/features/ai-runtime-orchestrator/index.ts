// AI Provider Layer™ End-to-End AI Runtime Orchestrator (Sprint 41) —
// a new top-level sibling feature: the first sprint since Sprint 36
// that *genuinely* coordinates multiple already-existing "approved"
// production features, rather than staying self-contained like
// Sprints 37-40. Wires the real Personalization/Recommendation/
// AI Mentor stack (Sprints 23-30) together with the deterministic
// Provider Selection (37) → Model Selection (38) → Request Execution
// Pipeline (39) → Provider Adapter Layer (36) → Response Processing
// Pipeline (40) chain into one deterministic, end-to-end run. No SDKs,
// no real network calls, no LLM inference, no streaming, no billing,
// no token accounting, no embeddings, no vector database, no
// conversation persistence, no UI rendering — "Do NOT implement" list
// honored in full.
//
// **"Mock Provider Adapter" (Execution Flow step 7) was confirmed with
// the user to mean `provider-adapter-layer` (Sprint 36)** — this
// sprint's own deterministic `DefaultProviderAdapter` — not the
// pre-existing, real `ai-provider` feature's own `MockProviderAdapter`
// (Sprint 5, async, tied to the real `AIProvider` ecosystem this whole
// arc has deliberately never touched).
//
// One real naming collision: `RuntimeResult` already exists at
// `src/hooks/exercise-engine/useUniversalExerciseRuntime.ts` (an
// unrelated exercise-runtime hook). Renamed to `AIRuntimeResult`,
// echoing this sprint's own feature name. The other 9 brief-named
// responsibilities (`AIRuntimeOrchestrator`, `RuntimeExecutionContext`,
// `RuntimeExecutionPlan`, `RuntimeCoordinator`, `RuntimeLifecycleManager`,
// `RuntimeState`, `RuntimeDiagnostics`, `RuntimeFailureHandler`,
// `RuntimeSuccessResult`) had zero exact matches anywhere.
//
// Two documented import exceptions, mirroring
// `ai-orchestration-pipeline`'s own precedent exactly:
// - `integration/RuntimeOrchestrationInputs.ts` (+ `testFixtures.ts`)
//   is the *only* place that imports real cross-feature *types*
//   (`PersonalizationProfile`/`PersonalizationExecutionPlan`/
//   `PersonalizationRecommendationSet`/`PersonalizationAdaptation`
//   from `@/features/personalization-engine`, `MemoryContext` from
//   `@/features/ai-memory-engine`).
// - `coordination/DefaultRuntimeCoordinator.ts` is the *only* file
//   permitted to import other features' factory *functions* directly
//   (`ai-mentor-personalization-bridge`, `ai-mentor-response-composer`,
//   `ai-mentor-prompt-assembler`, `provider-selection-engine`,
//   `model-selection-engine`, `request-execution-pipeline`,
//   `provider-adapter-layer`, `response-processing-pipeline`) —
//   "coordinating existing components" is this sprint's entire
//   purpose, so calling them is business logic, not a violation of the
//   "integration/ only" import-confinement rule (which still holds for
//   every type-only cross-feature reference).
//
// `types/RuntimeExecutionContext.ts` stays self-contained (a flat
// summary), mirroring `ai-orchestration-pipeline/types/AIOrchestrationContext.ts`'s
// own precedent, rather than carrying the real cross-feature payload
// objects (which only ever exist transiently inside
// `coordination/DefaultRuntimeCoordinator.ts` during one run).
// `RuntimeState` has 11 values, one per Execution Flow item plus
// `pending`/`failed`; `RuntimeLifecycleManager` enforces the fixed
// linear order. `RuntimeCoordinator.coordinate()` and
// `AIRuntimeOrchestrator.run()` never throw — an unresolvable run is
// `completionStatus: 'failed'` data, never an exception.

export * from './types'
export * from './lifecycle'
export * from './planning'
export * from './validation'
export * from './failureHandling'
export * from './diagnostics'
export * from './integration'
export * from './coordination'
export * from './orchestration'
