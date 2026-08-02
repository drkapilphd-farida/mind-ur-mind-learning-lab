// The Journey Context Engine's™ output — where the learner actually is
// in their journey right now. `completionPercent` is clamped to
// [0, 100] by DefaultJourneyContextEngine, never left to overflow.
export type JourneyContext = {
  currentJourney: string | null
  currentChapter: string | null
  currentLesson: string | null
  currentExercise: string | null
  completionPercent: number
  previousMilestones: readonly string[]
}
