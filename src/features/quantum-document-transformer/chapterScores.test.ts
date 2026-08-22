import { describe, expect, it } from 'vitest'
import { computeChapterScores, type ChapterScoreAttempt } from './chapterScores'

function makeAttempt(overrides: Partial<ChapterScoreAttempt> = {}): ChapterScoreAttempt {
  return {
    quantumDocumentId: 'doc-1',
    title: 'Chapter 1: Photosynthesis',
    scorePercent: 80,
    correctAnswersCount: 8,
    totalQuestionsCount: 10,
    occurredAt: '2026-08-20T00:00:00.000Z',
    ...overrides,
  }
}

describe('computeChapterScores', () => {
  it('returns one summary per chapter, never blending across documents', () => {
    const attempts = [
      makeAttempt({ quantumDocumentId: 'doc-1', title: 'Chapter 1', scorePercent: 30, occurredAt: '2026-08-20T00:00:00.000Z' }),
      makeAttempt({ quantumDocumentId: 'doc-2', title: 'Chapter 2', scorePercent: 85, occurredAt: '2026-08-19T00:00:00.000Z' }),
    ]

    const result = computeChapterScores(attempts)

    expect(result).toHaveLength(2)
    expect(result.find((chapter) => chapter.quantumDocumentId === 'doc-1')?.latestScorePercent).toBe(30)
    expect(result.find((chapter) => chapter.quantumDocumentId === 'doc-2')?.latestScorePercent).toBe(85)
  })

  it('honestly records a low score — never hides or excludes it', () => {
    const attempts = [makeAttempt({ scorePercent: 20, correctAnswersCount: 2, totalQuestionsCount: 10 })]

    const result = computeChapterScores(attempts)

    expect(result).toEqual([
      {
        quantumDocumentId: 'doc-1',
        title: 'Chapter 1: Photosynthesis',
        latestScorePercent: 20,
        latestCorrectAnswersCount: 2,
        latestTotalQuestionsCount: 10,
        bestScorePercent: 20,
        attemptsCount: 1,
        latestAttemptedAt: '2026-08-20T00:00:00.000Z',
      },
    ])
  })

  it('treats the first attempt per document as the latest (input assumed most-recent-first) and tracks the real best score separately', () => {
    const attempts = [
      makeAttempt({ scorePercent: 40, occurredAt: '2026-08-22T00:00:00.000Z' }), // latest, worse
      makeAttempt({ scorePercent: 90, occurredAt: '2026-08-20T00:00:00.000Z' }), // earlier, best
      makeAttempt({ scorePercent: 60, occurredAt: '2026-08-15T00:00:00.000Z' }),
    ]

    const result = computeChapterScores(attempts)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ latestScorePercent: 40, bestScorePercent: 90, attemptsCount: 3 })
  })

  it('sorts chapters by most recently attempted first', () => {
    const attempts = [
      makeAttempt({ quantumDocumentId: 'doc-old', title: 'Old chapter', occurredAt: '2026-08-01T00:00:00.000Z' }),
      makeAttempt({ quantumDocumentId: 'doc-new', title: 'New chapter', occurredAt: '2026-08-22T00:00:00.000Z' }),
    ]

    const result = computeChapterScores(attempts)

    expect(result.map((chapter) => chapter.quantumDocumentId)).toEqual(['doc-new', 'doc-old'])
  })

  it('returns an empty list for no attempts', () => {
    expect(computeChapterScores([])).toEqual([])
  })
})
