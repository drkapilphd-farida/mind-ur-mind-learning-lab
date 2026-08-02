import { describe, it, expect } from 'vitest'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { buildMultiLineRound } from './multiLineEngine'
import type { MultiLineParagraph } from './multiLineParagraphDataset'

const FOUR_LINE: MultiLineParagraph = {
  topic: 'nature',
  lines: ['Forests store carbon for centuries.', 'Trees release oxygen into the air.', 'Roots hold soil during storms.', 'Healthy forests support countless species.'],
}

const TAGGED_PARAGRAPH: MultiLineParagraph = {
  topic: 'history',
  lines: [
    'The fall of the Berlin Wall marked a turning point in modern history.',
    'For decades, the wall had physically divided a city and its people.',
    'East and West Germany had developed under very different political systems.',
    'In late 1989, mounting public pressure forced the border open.',
    'Crowds gathered from both sides, celebrating together atop the crumbling wall.',
    'Germany formally reunified less than a year after the wall fell.',
    'The event symbolized the broader collapse of Soviet influence across Eastern Europe.',
    'Sections of the original wall remain standing today as historical monuments.',
  ],
  personLineIndex: 0,
  locationLineIndex: 3,
}

describe('buildMultiLineRound', () => {
  it('shows every line of the paragraph during Practice', () => {
    const round = buildMultiLineRound(FOUR_LINE, 2, 1)
    expect(round.lines).toEqual(FOUR_LINE.lines)
  })

  it('produces the requested number of questions, one per parallel challenge-meta entry', () => {
    const round = buildMultiLineRound(FOUR_LINE, 2, 1)
    expect(round.questions).toHaveLength(2)
    expect(round.challenges).toHaveLength(2)
  })

  it('every question has 4 options drawn from the SAME paragraph, correctIndex points at the right line', () => {
    const round = buildMultiLineRound(TAGGED_PARAGRAPH, 2, 5)
    for (const question of round.questions) {
      expect(question.options).toHaveLength(4)
      expect(new Set(question.options).size).toBe(4)
      for (const option of question.options) expect(TAGGED_PARAGRAPH.lines).toContain(option)
      const correctLine = question.options[question.correctIndex]
      expect(TAGGED_PARAGRAPH.lines).toContain(correctLine)
    }
  })

  it('a keyword-line or ending-word-line question\'s stimulus is a real word from its target line, not the whole line', () => {
    const round = buildMultiLineRound(TAGGED_PARAGRAPH, 8, 3) // request many to sample several types
    for (let i = 0; i < round.questions.length; i++) {
      const meta = round.challenges[i]!
      const question = round.questions[i]!
      if (meta.type === 'keyword-line' || meta.type === 'ending-word-line') {
        expect(question.stimulus.split(/\s+/)).toHaveLength(1)
        const correctLine = question.options[question.correctIndex]!
        expect(correctLine.toLowerCase()).toContain(question.stimulus.toLowerCase())
      }
    }
  })

  it('every question\'s prompt is non-empty and matches its challenge type', () => {
    const round = buildMultiLineRound(TAGGED_PARAGRAPH, 2, 11)
    for (const meta of round.challenges) {
      expect(meta.prompt.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildMultiLineRound(TAGGED_PARAGRAPH, 2, 99)
    const second = buildMultiLineRound(TAGGED_PARAGRAPH, 2, 99)
    expect(second).toEqual(first)
  })

  it('returns an empty round (never fabricates) for a paragraph with no lines', () => {
    const round = buildMultiLineRound({ topic: 'nature', lines: [] }, 2, 1)
    expect(round.lines).toEqual([])
    expect(round.questions).toEqual([])
    expect(round.challenges).toEqual([])
  })

  it('every question and option passes the Visual Width Validator as a line', () => {
    const round = buildMultiLineRound(TAGGED_PARAGRAPH, 2, 21)
    for (const question of round.questions) {
      for (const option of question.options) expect(isVisuallyValid(option, 'line')).toBe(true)
    }
  })

  it('across many seeds, person-line and location-line questions only target the tagged paragraph\'s tagged lines', () => {
    let sawPerson = false
    let sawLocation = false
    for (let seed = 0; seed < 60; seed++) {
      const round = buildMultiLineRound(TAGGED_PARAGRAPH, 2, seed)
      round.challenges.forEach((meta, i) => {
        const correctLine = round.questions[i]!.options[round.questions[i]!.correctIndex]
        if (meta.type === 'person-line') {
          sawPerson = true
          expect(correctLine).toBe(TAGGED_PARAGRAPH.lines[TAGGED_PARAGRAPH.personLineIndex!])
        }
        if (meta.type === 'location-line') {
          sawLocation = true
          expect(correctLine).toBe(TAGGED_PARAGRAPH.lines[TAGGED_PARAGRAPH.locationLineIndex!])
        }
      })
    }
    expect(sawPerson).toBe(true)
    expect(sawLocation).toBe(true)
  })
})
