// Personalization Engine™ — Core Domain Foundation (Sprint 23).
// Deterministic profile, rule, and decision domain, backed by a
// facts-based rule engine ("No AI reasoning. No ML. No probability.").
//
// Cross-feature imports are deliberately confined to `integration/` —
// the *only* files in this feature that import
// `@/features/memory-context-assembly`, `@/features/memory-session-context`,
// or `@/features/memory-configuration-policy` (all "approved
// infrastructure" per Section 7: "AI Memory Engine™, Configuration &
// Policy Engine™"). `domain/`, `lifecycle/`, `contracts/`, `adapters/`,
// `repository/`, `ruleEngine/`, and `decision/` are all fully
// self-contained — every input the rule engine evaluates is a flat
// `PersonalizationFacts` record, never an imported external type. No
// direct dependency on Reading Lab™, Memory Lab™, or any UI module —
// none of those are imported anywhere in this feature.
//
// No AI provider calls, no ML, no neural networks, no embeddings, no
// semantic search, no prompt generation — "Do NOT implement" list
// honored in full.

export * from './domain'
export * from './lifecycle'
export * from './contracts'
export * from './adapters'
export * from './repository'
export * from './ruleEngine'
export * from './decision'
export * from './integration'
export * from './service'

// Sprint 24 — Strategy Engine™. Additive only, nothing above this line
// changed. Extends this same feature with strategy registration,
// evaluation, selection, and validation — `PersonalizationStrategy`
// reuses Sprint 23's own `PersonalizationCondition`/`evaluateCondition`
// intra-feature, and needs no new cross-feature imports: "AI Memory
// Engine™" integration (Section 7) is already satisfied by the
// existing `integration/` folder via `PersonalizationContext`.
export * from './strategyDomain'
export * from './strategyRegistry'
export * from './strategyValidation'
export * from './strategyEvaluation'
export * from './strategySelection'
export * from './strategyOrchestration'

// Sprint 25 — Execution Engine™. Additive only, nothing above this line
// changed. Deterministic core that turns Personalization Decisions,
// Selected Strategies (Sprint 24), Adaptive Learning Planner™ output,
// AI Memory Engine™ context, and Configuration into an immutable,
// validated `PersonalizationExecutionPlan`. Cross-feature imports for
// this sprint's one new dependency — Adaptive Learning Planner™ — are
// confined to `integration/`, same rule as Sprint 23/24; AI Memory
// Engine™ and Configuration integration reuse Sprint 23's existing
// `integration/` reducers rather than duplicating them. No AI provider
// calls, no ML, no UI — "Do NOT implement" list honored in full.
export * from './executionDomain'
export * from './executionSequencing'
export * from './executionPlanning'
export * from './executionValidation'
export * from './executionDiagnostics'
export * from './executionOrchestration'

// Sprint 26 — Recommendation Engine™. Additive only, nothing above this
// line changed. Deterministic core that turns a
// `PersonalizationExecutionPlan` (Sprint 25) — plus Personalization
// Decisions, Selected Strategies, Memory Context, and Configuration —
// into an immutable, ordered, validated `PersonalizationRecommendationSet`.
// No new cross-feature import types were needed: the Adaptive Learning
// Planner™ contribution is already carried inside the execution plan,
// and AI Memory Engine™/Configuration integration reuse Sprint 23's
// existing `integration/` reducers. No AI provider calls, no ML, no
// ranking models, no UI — "Do NOT implement" list honored in full.
export * from './recommendationDomain'
export * from './recommendationOrdering'
export * from './recommendationBuilder'
export * from './recommendationValidation'
export * from './recommendationDiagnostics'
export * from './recommendationOrchestration'

// Sprint 27 — Adaptation Engine™. Additive only, nothing above this
// line changed. Deterministic core that evaluates a Personalization
// Profile, a `PersonalizationRecommendationSet` (Sprint 26), learning
// progress, assessment results, memory context, and configuration
// against 5 fixed, in-code rules — no dynamic registry this sprint —
// producing an immutable, validated `PersonalizationAdaptation`. No new
// cross-feature import types were needed: the Adaptive Learning
// Planner™ contribution is already carried inside the recommendation
// set, and AI Memory Engine™/Configuration integration reuse Sprint
// 23's existing `integration/` reducers. No AI provider calls, no ML,
// no ranking models, no UI — "Do NOT implement" list honored in full.
export * from './adaptationDomain'
export * from './adaptationRules'
export * from './adaptationEvaluation'
export * from './adaptationValidation'
export * from './adaptationDiagnostics'
export * from './adaptationOrchestration'
