// The Sprint 23 brief's own Lifecycle example, verbatim. See
// `lifecycle/transitionPersonalizationLifecycle.ts` for the exact
// legal transition graph. Independently declared — not imported from
// `@/features/memory-session-context`'s own, identically-named-shape
// `SessionContextLifecycleState` — a `PersonalizationProfile` and a
// `SessionContext` are unrelated entities that happen to share a
// 4-state shape; coupling their lifecycles together would be an
// accidental, unwarranted dependency.
export type PersonalizationLifecycleState = 'created' | 'active' | 'suspended' | 'archived'
