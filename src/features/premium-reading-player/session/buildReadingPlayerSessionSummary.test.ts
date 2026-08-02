import { describe, expect, it } from 'vitest'
import { makeReadingIntelligenceExperienceResult, makeReadingPlayerExerciseOutcome } from '../testFixtures'
import { buildReadingPlayerSessionSummary } from './buildReadingPlayerSessionSummary'

describe('buildReadingPlayerSessionSummary', () => {
  it('Reading Score: passes through the caller-reported accuracyPercent unchanged', () => {
    const summary = buildReadingPlayerSessionSummary(
      makeReadingPlayerExerciseOutcome({ accuracyPercent: 87 }),
      makeReadingIntelligenceExperienceResult(),
    )

    expect(summary.readingScore).toBe(87)
  })

  it('Reading Score: is null for a mode with no scored outcome (e.g. RSVP)', () => {
    const summary = buildReadingPlayerSessionSummary(
      makeReadingPlayerExerciseOutcome({ accuracyPercent: null }),
      makeReadingIntelligenceExperienceResult(),
    )

    expect(summary.readingScore).toBeNull()
  })

  it('Mind Score Update / XP Reward / Continue Learning: sourced directly from the reading-intelligence result, never recomputed', () => {
    const experience = makeReadingIntelligenceExperienceResult({
      journeyState: {
        ...makeReadingIntelligenceExperienceResult().journeyState,
        mindScore: 613,
        mindScoreLabel: 'Excellent Progress',
      },
      xp: { totalXp: 120, fromCompletedExercises: 100, fromStreak: 20 },
      dailyMission: {
        stageId: 'flash-intelligence-pack',
        stageTitle: 'Flash Intelligence Pack™',
        actionLabel: 'Continue: Word Flash',
        continueHref: '/labs/quantum-speed-reading/word-flash',
        isAllDone: false,
      },
    })

    const summary = buildReadingPlayerSessionSummary(makeReadingPlayerExerciseOutcome(), experience)

    expect(summary).toEqual({
      readingScore: 92,
      mindScore: 613,
      mindScoreLabel: 'Excellent Progress',
      xp: { totalXp: 120, fromCompletedExercises: 100, fromStreak: 20 },
      continueHref: '/labs/quantum-speed-reading/word-flash',
      continueLabel: 'Continue: Word Flash',
    })
  })

  it('Determinism: identical inputs produce identical output', () => {
    const outcome = makeReadingPlayerExerciseOutcome()
    const experience = makeReadingIntelligenceExperienceResult()

    expect(buildReadingPlayerSessionSummary(outcome, experience)).toEqual(
      buildReadingPlayerSessionSummary(outcome, experience),
    )
  })
})
