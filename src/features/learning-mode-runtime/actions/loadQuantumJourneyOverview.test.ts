import { describe, expect, it } from 'vitest'
import { deriveQuantumJourneyChapters, type DeriveChapterInput } from './internal/deriveQuantumJourneyChapters'

function chapter(overrides: Partial<DeriveChapterInput> & { chapterOrder: number }): DeriveChapterInput {
  return { title: null, estimatedMinutes: null, isCompleted: false, isStarted: false, assessmentScore: null, ...overrides }
}

describe('deriveQuantumJourneyChapters', () => {
  it('marks a never-touched document as chapter 0 ready, everything after locked', () => {
    const { chapters, currentChapterOrder, chaptersCompleted } = deriveQuantumJourneyChapters([chapter({ chapterOrder: 0 }), chapter({ chapterOrder: 1 }), chapter({ chapterOrder: 2 })])
    expect(chapters.map((c) => c.status)).toEqual(['ready', 'locked', 'locked'])
    expect(currentChapterOrder).toBe(0)
    expect(chaptersCompleted).toBe(0)
  })

  it('marks an in-progress chapter as current, not ready', () => {
    const { chapters, currentChapterOrder } = deriveQuantumJourneyChapters([chapter({ chapterOrder: 0, isStarted: true }), chapter({ chapterOrder: 1 })])
    expect(chapters[0]?.status).toBe('current')
    expect(chapters[1]?.status).toBe('locked')
    expect(currentChapterOrder).toBe(0)
  })

  it('unlocks the next chapter once the previous one is completed', () => {
    const { chapters, currentChapterOrder, chaptersCompleted } = deriveQuantumJourneyChapters([
      chapter({ chapterOrder: 0, isCompleted: true, isStarted: true }),
      chapter({ chapterOrder: 1 }),
      chapter({ chapterOrder: 2 }),
    ])
    expect(chapters.map((c) => c.status)).toEqual(['completed', 'ready', 'locked'])
    expect(currentChapterOrder).toBe(1)
    expect(chaptersCompleted).toBe(1)
  })

  it('marks the last chapter current for display once every chapter is completed', () => {
    const { chapters, currentChapterOrder, chaptersCompleted } = deriveQuantumJourneyChapters([
      chapter({ chapterOrder: 0, isCompleted: true, isStarted: true }),
      chapter({ chapterOrder: 1, isCompleted: true, isStarted: true }),
    ])
    expect(chapters.every((c) => c.status === 'completed')).toBe(true)
    expect(currentChapterOrder).toBe(1)
    expect(chaptersCompleted).toBe(2)
  })

  it('falls back to an honest default title/estimate when no real Blueprint data exists', () => {
    const { chapters } = deriveQuantumJourneyChapters([chapter({ chapterOrder: 0 })])
    expect(chapters[0]).toMatchObject({ title: 'Chapter 1', estimatedMinutes: 3 })
  })

  it('preserves a real title/estimate/assessmentScore verbatim when present', () => {
    const { chapters } = deriveQuantumJourneyChapters([chapter({ chapterOrder: 0, title: 'Photosynthesis', estimatedMinutes: 7, isCompleted: true, isStarted: true, assessmentScore: { correct: 2, total: 3 } })])
    expect(chapters[0]).toMatchObject({ title: 'Photosynthesis', estimatedMinutes: 7, assessmentScore: { correct: 2, total: 3 } })
  })

  it('never throws and returns an empty list for a document with zero chapters', () => {
    const { chapters, currentChapterOrder, chaptersCompleted } = deriveQuantumJourneyChapters([])
    expect(chapters).toEqual([])
    expect(currentChapterOrder).toBe(0)
    expect(chaptersCompleted).toBe(0)
  })
})
