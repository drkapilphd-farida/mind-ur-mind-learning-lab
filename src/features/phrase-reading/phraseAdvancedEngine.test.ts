import { describe, it, expect } from 'vitest'
import { buildAdvancedPhraseRound, computeBestStreak } from './phraseAdvancedEngine'
import type { AdvancedPhrase } from './phraseAdvancedLibrary'

const TARGET: AdvancedPhrase = {
  text: 'developing a simple method for cleaning water',
  topic: 'processing', gloss: 'Water cleaning method', keyWord: 'method',
  missingWord: { template: 'Developing A ______ Method For Cleaning Water', options: ['Simple', 'Yellow', 'Morning', 'Quickly'] },
  meaningMatch: { correctParaphrase: 'A cleaning method was developed', distractors: ['The method was never found', 'Water became more polluted', 'The method stopped working'] },
  correctEnding: { stem: 'Developing A Method For...', options: ['Cleaning Water', 'Baking Bread', 'Painting Walls', 'Writing Music'] },
}

const OTHER_PHRASES: AdvancedPhrase[] = [
  { text: 'strengthening daily focus through steady practice', topic: 'focus', gloss: 'Steady focus building', keyWord: 'focus' },
  { text: 'increasing reading speed through daily repetition', topic: 'reading-speed', gloss: 'Speed through repetition', keyWord: 'speed' },
  { text: 'sharpening pattern recognition across many sessions', topic: 'recognition', gloss: 'Pattern recognition growth', keyWord: 'recognition' },
  { text: 'building lasting confidence through visible progress', topic: 'confidence', gloss: 'Confidence from progress', keyWord: 'confidence' },
]

const LEVEL_POOL: AdvancedPhrase[] = [TARGET, ...OTHER_PHRASES]

describe('buildAdvancedPhraseRound', () => {
  it('produces exactly one question per requested type', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['main-idea', 'key-idea'], 1)
    expect(round.questions).toHaveLength(2)
    expect(round.challenges).toHaveLength(2)
    expect(round.challenges.map((c) => c.type)).toEqual(['main-idea', 'key-idea'])
  })

  it('main-idea: correct answer is the phrase\'s own gloss, distractors come from OTHER phrases in the pool', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['main-idea'], 5)
    const q = round.questions[0]!
    expect(q.options[q.correctIndex]).toBe(TARGET.gloss)
    for (const option of q.options) {
      if (option === TARGET.gloss) continue
      expect(OTHER_PHRASES.map((p) => p.gloss)).toContain(option)
    }
  })

  it('key-idea: correct answer is the phrase\'s own keyWord, distractors come from OTHER phrases', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['key-idea'], 5)
    const q = round.questions[0]!
    expect(q.options[q.correctIndex]).toBe(TARGET.keyWord)
    for (const option of q.options) {
      if (option === TARGET.keyWord) continue
      expect(OTHER_PHRASES.map((p) => p.keyWord)).toContain(option)
    }
  })

  it('idea-category: correct answer is the phrase\'s own topic label, distractors are OTHER topics', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['idea-category'], 5)
    const q = round.questions[0]!
    expect(q.options[q.correctIndex]).toBe('Processing')
    const distractorOptions = q.options.filter((_, i) => i !== q.correctIndex)
    expect(distractorOptions).not.toContain('Processing')
    expect(new Set(distractorOptions).size).toBe(3)
  })

  it('missing-word: stimulus is the template, correct answer is options[0]', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['missing-word'], 5)
    const q = round.questions[0]!
    expect(q.stimulus).toBe(TARGET.missingWord!.template)
    expect(q.options[q.correctIndex]).toBe('Simple')
  })

  it('meaning-match: stimulus is the full re-shown phrase, correct answer is the authored paraphrase', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['meaning-match'], 5)
    const q = round.questions[0]!
    expect(q.stimulus).toBe(TARGET.text)
    expect(q.options[q.correctIndex]).toBe('A cleaning method was developed')
  })

  it('correct-ending: stimulus is the stem, correct answer is options[0]', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['correct-ending'], 5)
    const q = round.questions[0]!
    expect(q.stimulus).toBe(TARGET.correctEnding!.stem)
    expect(q.options[q.correctIndex]).toBe('Cleaning Water')
  })

  it('falls back to main-idea when the phrase lacks the requested optional field', () => {
    const bare: AdvancedPhrase = { text: 'something important happening somewhere today', topic: 'attention', gloss: 'General event', keyWord: 'important' }
    const round = buildAdvancedPhraseRound(bare, [bare, ...OTHER_PHRASES], ['missing-word'], 5)
    expect(round.challenges[0]!.type).toBe('main-idea')
    expect(round.questions[0]!.options[round.questions[0]!.correctIndex]).toBe('General event')
  })

  it('is deterministic for a given seed', () => {
    const first = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['main-idea', 'missing-word'], 77)
    const second = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['main-idea', 'missing-word'], 77)
    expect(second).toEqual(first)
  })

  it('every question has 4 distinct options', () => {
    const round = buildAdvancedPhraseRound(TARGET, LEVEL_POOL, ['main-idea', 'key-idea', 'idea-category', 'missing-word', 'meaning-match', 'correct-ending'], 9)
    for (const q of round.questions) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
    }
  })
})

describe('computeBestStreak (re-exported from Sentence Reading, read-only)', () => {
  it('is accessible from this module and computes correctly', () => {
    expect(computeBestStreak([{ isCorrect: true }, { isCorrect: true }, { isCorrect: false }])).toBe(2)
  })
})
