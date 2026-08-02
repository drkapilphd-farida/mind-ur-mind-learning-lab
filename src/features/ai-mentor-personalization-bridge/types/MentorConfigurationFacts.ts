// A flat, self-contained bag of configuration facts — same shape as
// the Personalization Engine's™ own `PersonalizationFacts`,
// independently declared rather than imported, so this feature's
// `types/`, `validation/`, `contextAssembly/`, and `orchestration/`
// never need to import `@/features/personalization-engine` directly —
// only `../integration/` does, and only for the domain objects that
// actually need reducing. Same "independently declared, not coupled"
// convention as `PersonalizationLifecycleState`'s own comment.
export type MentorConfigurationFacts = Readonly<Record<string, string | number | boolean>>
