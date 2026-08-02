import { describe, it, expect } from 'vitest'
import { buildChapterChallenges, computeBestStreak } from './sentenceEngine'
import { SENTENCE_CHAPTERS, SENTENCE_THEME_NAME } from './sentenceLibrary'

const CHAPTER = SENTENCE_CHAPTERS[1][0]!

describe('buildChapterChallenges', () => {
  it('produces exactly one question per requested type', () => {
    const result = buildChapterChallenges(CHAPTER, ['main-idea', 'todays-topic'], 1)
    expect(result.questions).toHaveLength(2)
    expect(result.challenges).toHaveLength(2)
    expect(result.challenges.map((c) => c.type)).toEqual(['main-idea', 'todays-topic'])
  })

  it('todays-topic: correct answer is the chapter\'s own theme name, distractors are OTHER level themes', () => {
    const result = buildChapterChallenges(CHAPTER, ['todays-topic'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(SENTENCE_THEME_NAME[CHAPTER.theme!])
    const distractorOptions = q.options.filter((_, i) => i !== q.correctIndex)
    expect(distractorOptions).not.toContain(SENTENCE_THEME_NAME[CHAPTER.theme!])
    expect(new Set(distractorOptions).size).toBe(3)
  })

  it('true-statement: correct answer is the authored true paraphrase, distractors are the authored false statements', () => {
    const result = buildChapterChallenges(CHAPTER, ['true-statement'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(CHAPTER.trueStatement!.trueParaphrase)
  })

  it('best-summary: correct answer is the authored chapter summary', () => {
    const result = buildChapterChallenges(CHAPTER, ['best-summary'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(CHAPTER.chapterSummary!.correctSummary)
  })

  it('main-idea: correct answer is the authored main idea', () => {
    const result = buildChapterChallenges(CHAPTER, ['main-idea'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(CHAPTER.mainIdea!.correctIdea)
  })

  it('not-mentioned: correct answer is the absent idea, distractors are real sentence glosses that WERE mentioned', () => {
    const result = buildChapterChallenges(CHAPTER, ['not-mentioned'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(CHAPTER.notMentioned!.absentIdea)
    const distractorOptions = q.options.filter((_, i) => i !== q.correctIndex)
    const realGlosses = CHAPTER.sentences.map((s) => s.gloss)
    for (const option of distractorOptions) expect(realGlosses).toContain(option)
  })

  it('best-title: correct answer is the chapter title, distractors are the authored unrelated titles', () => {
    const result = buildChapterChallenges(CHAPTER, ['best-title'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(CHAPTER.chapterTitle)
  })

  it('cause-effect: correct answer is the authored cause', () => {
    const result = buildChapterChallenges(CHAPTER, ['cause-effect'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(CHAPTER.causeEffect!.cause)
  })

  it('meaning-match: correct answer is the authored paraphrase', () => {
    const result = buildChapterChallenges(CHAPTER, ['meaning-match'], 5)
    const q = result.questions[0]!
    expect(q.options[q.correctIndex]).toBe(CHAPTER.meaningMatch!.correctParaphrase)
  })

  it('sequence: correct answer is whichever of the 4 chosen sentences appeared earliest in reading order', () => {
    const result = buildChapterChallenges(CHAPTER, ['sequence'], 3)
    const q = result.questions[0]!
    const realGlosses = CHAPTER.sentences.map((s) => s.gloss)
    expect(realGlosses).toContain(q.options[q.correctIndex])
  })

  it('no question re-shows chapter text as a visible stimulus (stimulus is the correct answer for internal bookkeeping only)', () => {
    const result = buildChapterChallenges(CHAPTER, ['meaning-match', 'best-title'], 5)
    for (const q of result.questions) {
      for (const sentence of CHAPTER.sentences) expect(q.stimulus).not.toBe(sentence.text)
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildChapterChallenges(CHAPTER, ['main-idea', 'sequence'], 77)
    const second = buildChapterChallenges(CHAPTER, ['main-idea', 'sequence'], 77)
    expect(second).toEqual(first)
  })

  it('every question has 4 distinct options', () => {
    const result = buildChapterChallenges(CHAPTER, ['todays-topic', 'true-statement', 'best-summary', 'main-idea', 'not-mentioned', 'best-title', 'cause-effect', 'meaning-match', 'sequence'], 9)
    for (const q of result.questions) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
    }
  })

  it('builds a full 4-question Brain Challenge across all levels\' first chapters without dropping a question', () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      const chapter = SENTENCE_CHAPTERS[level][0]!
      const result = buildChapterChallenges(chapter, ['todays-topic', 'main-idea', 'best-title', 'sequence'], 11)
      expect(result.questions).toHaveLength(4)
    }
  })
})

describe('computeBestStreak (preserved verbatim — Phrase Reading Level 5 imports this read-only)', () => {
  it('returns 0 for no responses', () => {
    expect(computeBestStreak([])).toBe(0)
  })

  it('returns the length of a single unbroken run', () => {
    expect(computeBestStreak([{ isCorrect: true }, { isCorrect: true }, { isCorrect: true }])).toBe(3)
  })

  it('finds the longest of several runs, not just the last one', () => {
    const responses = [
      { isCorrect: true }, { isCorrect: true }, { isCorrect: false },
      { isCorrect: true }, { isCorrect: true }, { isCorrect: true }, { isCorrect: true },
      { isCorrect: false }, { isCorrect: true },
    ]
    expect(computeBestStreak(responses)).toBe(4)
  })

  it('returns 0 when every response is wrong', () => {
    expect(computeBestStreak([{ isCorrect: false }, { isCorrect: false }])).toBe(0)
  })
})
