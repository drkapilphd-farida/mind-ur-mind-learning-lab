import type { MentorAction, MentorResponse, MentorResponseCard, MentorResponseSection } from '../types'
import type { ResponseComposerInputs } from './ResponseComposerInputs'

// Pure — "Compose responses ... Produce only structured response
// objects. No natural-language writing." Builds the 6 fixed sections,
// in the Sprint 29 brief's own Section 3 order, always — a section
// with nothing to say still appears, with empty `cards`/`actions`,
// never omitted (mirrors the Adaptation Engine's™ own "always produce
// a result" precedent, Sprint 27).
export function composeMentorResponse(inputs: ResponseComposerInputs, now: string, id: string): MentorResponse {
  const greetingCard: MentorResponseCard = { id: 'greeting-lifecycle', title: 'Learner Status', values: [inputs.profileLifecycle] }
  const learningSummaryCard: MentorResponseCard = {
    id: 'learning-summary',
    title: 'Learning Summary',
    values: [inputs.currentJourney ?? 'none', inputs.difficultyLevel ?? 'none'],
  }
  const recommendationCards: MentorResponseCard[] =
    inputs.recommendationItems.length === 0
      ? []
      : [
          {
            id: 'recommendation-summary',
            title: 'Active Recommendations',
            values: inputs.recommendationItems.map((item) => `${item.category}:${item.referenceId}`),
          },
        ]
  const nextActions: MentorAction[] =
    inputs.recommendationItems.length === 0
      ? []
      : [
          {
            id: `action-${inputs.recommendationItems[0]!.referenceId}`,
            label: `review-${inputs.recommendationItems[0]!.category}`,
            referenceId: inputs.recommendationItems[0]!.referenceId,
          },
        ]
  const progressValues = [...inputs.reviewReferenceIds, ...inputs.sessionReferenceIds]
  const progressCards: MentorResponseCard[] = progressValues.length === 0 ? [] : [{ id: 'progress-summary', title: 'Progress Summary', values: progressValues }]
  const motivationCard: MentorResponseCard = { id: 'motivation-metadata', title: 'Motivation Metadata', values: [String(inputs.appliedAdaptationCount)] }

  const sections: MentorResponseSection[] = [
    { type: 'greeting-context', cards: [greetingCard], actions: [] },
    { type: 'learning-summary', cards: [learningSummaryCard], actions: [] },
    { type: 'active-recommendation-summary', cards: recommendationCards, actions: [] },
    { type: 'next-action', cards: [], actions: nextActions },
    { type: 'progress-summary', cards: progressCards, actions: [] },
    { type: 'motivation-metadata', cards: [motivationCard], actions: [] },
  ]

  return {
    id,
    version: 1,
    sections,
    metadata: { learnerId: inputs.learnerId, profileId: inputs.profileId, source: 'response-composer', generatedAt: now },
  }
}
