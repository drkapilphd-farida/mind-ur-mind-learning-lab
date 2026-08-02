// A flat, provider-agnostic bag of named facts — every rule condition
// (see `PersonalizationCondition.ts`) reads from one of these. Keeping
// facts flat and primitive-valued (never a nested object, never a
// reference to another feature's domain type) is what lets the rule
// engine itself stay fully self-contained and deterministic: it never
// needs to know *where* a fact came from, only its name and value.
// Real facts are derived from external, approved infrastructure by
// `integration/` — the rule engine and domain models never import
// that infrastructure directly.
export type PersonalizationFacts = Readonly<Record<string, string | number | boolean>>
