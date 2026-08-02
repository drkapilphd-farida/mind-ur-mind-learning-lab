import { describe, it, expect } from 'vitest'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import {
  SENTENCE_CHAPTERS,
  getChapterForLevel,
  sentenceWordCount,
  SENTENCE_THEME_BY_LEVEL,
  SENTENCE_THEME_NAME,
  type SentenceChapter,
} from './sentenceLibrary'
import { SENTENCE_LEVEL_REQUIREMENTS } from './sentenceDifficulty'
import type { SentenceReadingLevel } from './sentenceDifficulty'

const LEVELS: SentenceReadingLevel[] = [1, 2, 3, 4, 5]

// Product-identity regression guard: these exact strings only exist in
// Phrase Reading's cluster dataset (src/features/phrase-reading/
// phraseClusterDataset.ts) — Sentence Reading must never display them, at
// any level, in any field.
const KNOWN_PHRASE_READING_STRINGS = ['react faster', 'improve memory', 'train daily', 'read faster', 'stay focused']

function allChaptersFlat(): readonly SentenceChapter[] {
  return LEVELS.flatMap((level) => SENTENCE_CHAPTERS[level])
}

describe('SENTENCE_CHAPTERS', () => {
  it('defines at least 2 chapters for every one of the 5 levels', () => {
    for (const level of LEVELS) {
      expect(SENTENCE_CHAPTERS[level].length).toBeGreaterThanOrEqual(2)
    }
  })

  it('every chapter belongs to its level\'s single locked theme — never mixed', () => {
    for (const level of LEVELS) {
      for (const chapter of SENTENCE_CHAPTERS[level]) {
        expect(chapter.theme).toBe(SENTENCE_THEME_BY_LEVEL[level])
      }
    }
  })

  it('every chapter has exactly 5 sentences', () => {
    for (const chapter of allChaptersFlat()) {
      expect(chapter.sentences).toHaveLength(5)
    }
  })

  it('never contains known Phrase Reading strings, in any field', () => {
    for (const chapter of allChaptersFlat()) {
      const allText = [
        chapter.chapterTitle,
        ...chapter.sentences.map((s) => `${s.text} ${s.gloss}`),
      ].join(' ').toLowerCase()
      for (const banned of KNOWN_PHRASE_READING_STRINGS) {
        expect(allText).not.toContain(banned)
      }
    }
  })

  it('every sentence has at least 6 words — never a 2-4 word phrase', () => {
    for (const chapter of allChaptersFlat()) {
      for (const sentence of chapter.sentences) {
        expect(sentenceWordCount(sentence.text)).toBeGreaterThanOrEqual(6)
      }
    }
  })

  it('every sentence ends with terminal punctuation — a complete thought, not a fragment', () => {
    for (const chapter of allChaptersFlat()) {
      for (const sentence of chapter.sentences) {
        expect(sentence.text.trim()).toMatch(/[.!?]$/)
      }
    }
  })

  it('every sentence\'s word count falls within its level\'s declared range', () => {
    for (const level of LEVELS) {
      const { minWords, maxWords } = SENTENCE_LEVEL_REQUIREMENTS[level]
      for (const chapter of SENTENCE_CHAPTERS[level]) {
        for (const sentence of chapter.sentences) {
          const count = sentenceWordCount(sentence.text)
          expect(count).toBeGreaterThanOrEqual(minWords)
          expect(count).toBeLessThanOrEqual(maxWords)
        }
      }
    }
  })

  it('every sentence passes the Visual Width Validator (checked at the strictest role)', () => {
    for (const chapter of allChaptersFlat()) {
      for (const sentence of chapter.sentences) {
        expect(isVisuallyValid(sentence.text, 'option')).toBe(true)
      }
    }
  })

  it('no duplicate sentence text within a chapter', () => {
    for (const chapter of allChaptersFlat()) {
      const texts = chapter.sentences.map((s) => s.text)
      expect(new Set(texts).size).toBe(texts.length)
    }
  })

  it('notMentioned.absentIdea never fuzzy-matches any sentence\'s text or gloss (would break the type\'s correctness)', () => {
    for (const chapter of allChaptersFlat()) {
      const absent = chapter.notMentioned!.absentIdea.toLowerCase()
      for (const sentence of chapter.sentences) {
        expect(absent).not.toBe(sentence.text.toLowerCase())
        expect(absent).not.toBe(sentence.gloss.toLowerCase())
      }
    }
  })

  it('notMentioned.mentionedGlossIndices reference 3 distinct, valid sentence indices', () => {
    for (const chapter of allChaptersFlat()) {
      const indices = chapter.notMentioned!.mentionedGlossIndices
      expect(new Set(indices).size).toBe(3)
      for (const i of indices) expect(i).toBeGreaterThanOrEqual(0)
      for (const i of indices) expect(i).toBeLessThanOrEqual(4)
    }
  })

  it('every chapter\'s field-based challenge content has exactly 3 distinct distractors, none equal to the correct answer', () => {
    for (const chapter of allChaptersFlat()) {
      const groups: { correct: string; distractors: readonly string[] }[] = [
        { correct: chapter.trueStatement!.trueParaphrase, distractors: chapter.trueStatement!.falseStatements },
        { correct: chapter.chapterSummary!.correctSummary, distractors: chapter.chapterSummary!.distractors },
        { correct: chapter.mainIdea!.correctIdea, distractors: chapter.mainIdea!.distractors },
        { correct: chapter.chapterTitle!, distractors: chapter.bestTitle!.distractorTitles },
        { correct: chapter.causeEffect!.cause, distractors: chapter.causeEffect!.distractors },
        { correct: chapter.meaningMatch!.correctParaphrase, distractors: chapter.meaningMatch!.distractors },
      ]
      for (const { correct, distractors } of groups) {
        expect(distractors).toHaveLength(3)
        expect(new Set(distractors).size).toBe(3)
        expect(distractors).not.toContain(correct)
      }
    }
  })

  it('every theme has a real display name', () => {
    for (const level of LEVELS) {
      expect(SENTENCE_THEME_NAME[SENTENCE_THEME_BY_LEVEL[level]]).toBeTruthy()
    }
  })
})

describe('getChapterForLevel', () => {
  it('returns a chapter belonging to the requested level', () => {
    const chapter = getChapterForLevel(2, new Set(), 1)
    expect(chapter.level).toBe(2)
  })

  it('excludes chapters already used this session, when another remains', () => {
    const pool = SENTENCE_CHAPTERS[1]
    const used = new Set([pool[0]!.id])
    const chapter = getChapterForLevel(1, used, 1)
    expect(chapter.id).not.toBe(pool[0]!.id)
  })

  it('falls back to the full pool rather than failing when every chapter has been used', () => {
    const used = new Set(SENTENCE_CHAPTERS[1].map((c) => c.id))
    const chapter = getChapterForLevel(1, used, 1)
    expect(chapter.level).toBe(1)
  })

  it('is deterministic for a given seed', () => {
    const first = getChapterForLevel(3, new Set(), 42)
    const second = getChapterForLevel(3, new Set(), 42)
    expect(second).toEqual(first)
  })
})
