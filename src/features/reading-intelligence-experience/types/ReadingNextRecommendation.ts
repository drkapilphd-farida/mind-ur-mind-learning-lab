// "Next Recommended Exercise" (§ brief), as a standalone card — the data
// already exists (Sprint 48's ReadingIntelligenceJourney.nextRecommendationLabel/Href),
// this is only a presentational reshape, never a new computation.
export type ReadingNextRecommendation = {
  readonly label: string
  readonly href: string
  readonly stageTitle: string
}
