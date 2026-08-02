// AI Mentor™ Prompt Assembly Engine (Sprint 30) — a standalone sibling
// feature to `@/features/ai-mentor-response-composer` (Sprint 29) and
// `@/features/ai-mentor-personalization-bridge` (Sprint 28), same
// shape and posture: "its own bounded context," one-way reader of
// both, never the other way around.
//
// Four of the brief's own domain model names collided or risked
// colliding: `PromptSection` already exists at
// `@/features/ai-intelligence-layer/types/PromptSection.ts` — a
// `{title, content}` string-pair holding *natural-language prose*
// (that feature's own `formatContextSections.ts` writes sentences).
// Different feature, different shape, different philosophy than this
// sprint's "No natural-language generation" constraint — renamed to
// `MentorPromptSection` rather than reused, and its 3 siblings
// (`PromptContext`, `PromptInstruction`, `PromptMetadata` — none of
// which literally collided) were renamed alongside it for family-naming
// consistency, same "rename siblings together" reasoning Sprint 28
// applied to `MentorContext`/`MentorContextSnapshot`. `MentorPromptPayload`
// itself had zero collision and kept the brief's own name.
//
// `@/features/ai-intelligence-layer`'s own `PromptPackage` — a
// conceptually similar, fully-wired object — is deliberately not
// reused or extended: confirmed fully unconsumed by anything outside
// its own feature, and its sibling `mentor-conversation-engine` already
// chose to build its own separate type rather than reuse it. Same
// precedent followed here.
//
// Assembly stops strictly before provider translation or execution:
// structurally analogous to `@/features/ai-mentor/contracts/PromptBuilder.ts`'s
// own `MentorPrompt`, but this feature never produces a `MentorPrompt`,
// never calls `mapMentorPromptToAIRequest`-style translation, and never
// calls a `ProviderAdapter`. `ai-mentor` itself is not imported —
// producer-only, same posture as Sprints 28-29.
//
// Cross-feature imports are confined to `integration/` — the *only*
// files here that import `@/features/ai-mentor-response-composer` or
// `@/features/ai-mentor-personalization-bridge`. `types/`, `assembly/`,
// `validation/`, `diagnostics/`, and `orchestration/` internals are all
// fully self-contained. No AI provider calls, no ML, no prompt
// execution, no LLM API calls, no token counting, no streaming, no
// embeddings, no semantic search, no UI — "Do NOT implement" list
// honored in full.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './integration'
export * from './assembly'
export * from './validation'
export * from './diagnostics'
export * from './orchestration'
