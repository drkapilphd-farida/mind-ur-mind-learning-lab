// The already-reduced, fully self-contained inputs the composer
// consumes — real reduction from `MentorPersonalizationContext` /
// `PersonalizationExecutionPlan` happens in
// `../integration/buildResponseComposerInputs.ts`.
export type ResponseComposerRecommendationItem = {
  readonly category: string
  readonly referenceId: string
  readonly priority: string
}

export type ResponseComposerInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly currentJourney: string | null
  readonly difficultyLevel: string | null
  readonly profileLifecycle: string
  readonly appliedAdaptationCount: number
  readonly recommendationItems: readonly ResponseComposerRecommendationItem[]
  readonly reviewReferenceIds: readonly string[]
  readonly sessionReferenceIds: readonly string[]
}
