// Immutable — every field `readonly`. A minimal, self-contained
// descriptor of what's being requested — the real, cross-feature-type-
// bearing inputs (the Personalization Engine™ objects, the memory
// context, ...) live in `../integration/AIOrchestrationInputs.ts`, not
// here, same "types/ stays self-contained" discipline as every prior
// sprint.
export type AIOrchestrationRequest = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerId: string
}
