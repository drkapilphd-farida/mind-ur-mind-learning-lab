// Immutable — every field `readonly`. The brief's own "SessionContext"
// responsibility, renamed — a real, exact collision found via
// repo-wide grep with
// `memory-session-context/domain/SessionContext.ts` (an unrelated
// memory/conversation-context concept). Renamed to echo this sprint's
// own feature name. "Runtime context binding" (§ Responsibilities) —
// `providerId`/`modelId` are nullable since they're bound once
// execution actually starts, not necessarily known at session
// creation.
export type AIExecutionSessionContext = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerId: string | null
  readonly modelId: string | null
}
