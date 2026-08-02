// The already-reduced, fully self-contained inputs the assembler
// consumes — real reduction from `MentorResponse`/
// `MentorPersonalizationContext` happens in
// `../integration/buildPromptAssemblyInputs.ts`.
export type PromptAssemblyInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly sourceResponseId: string
  readonly responseSource: string
  readonly profileLifecycle: string
  readonly currentJourney: string | null
  readonly difficultyLevel: string | null
  readonly recommendationValues: readonly string[]
  readonly nextActionValues: readonly string[]
  readonly memoryReferenceIds: readonly string[]
  readonly appliedAdaptationCount: number
}
