import type { ReadingIntelligenceJourney } from '@/features/reading-intelligence-journey'
import type { ReadingNextRecommendation } from '../types'

// Pure — a direct reshape of Sprint 48's already-computed nextRecommendationLabel/Href.
// `stageTitle` provides the "from where" framing for the card (the current
// stage), never a new recommendation computation.
export function buildReadingNextRecommendation(journey: ReadingIntelligenceJourney): ReadingNextRecommendation {
  return {
    label: journey.nextRecommendationLabel,
    href: journey.nextRecommendationHref,
    stageTitle: journey.welcomeTitle,
  }
}
