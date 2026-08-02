import { describe, it, expect } from 'vitest'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import { MULTI_LINE_PARAGRAPHS, getMultiLineParagraphsForLevel } from './multiLineParagraphDataset'
import { MULTI_LINE_LEVEL_REQUIREMENTS } from './multiLineDifficulty'
import type { MultiLineReadingLevel } from './multiLineDifficulty'

const LEVELS: MultiLineReadingLevel[] = [1, 2, 3, 4, 5]

describe('MULTI_LINE_PARAGRAPHS', () => {
  it('defines paragraphs for every one of the 5 levels', () => {
    for (const level of LEVELS) {
      expect(MULTI_LINE_PARAGRAPHS[level].length).toBeGreaterThan(0)
    }
  })

  it('every paragraph has exactly the line count its level requires', () => {
    for (const level of LEVELS) {
      const expectedLineCount = MULTI_LINE_LEVEL_REQUIREMENTS[level].lineCount
      for (const paragraph of MULTI_LINE_PARAGRAPHS[level]) {
        expect(paragraph.lines).toHaveLength(expectedLineCount)
      }
    }
  })

  it('every line passes the Visual Width Validator as a line', () => {
    for (const level of LEVELS) {
      for (const paragraph of MULTI_LINE_PARAGRAPHS[level]) {
        for (const line of paragraph.lines) {
          expect(isVisuallyValid(line, 'line')).toBe(true)
        }
      }
    }
  })

  it('every paragraph has at least 4 distinct lines (enough for a 4-option question)', () => {
    for (const level of LEVELS) {
      for (const paragraph of MULTI_LINE_PARAGRAPHS[level]) {
        expect(new Set(paragraph.lines).size).toBe(paragraph.lines.length)
        expect(paragraph.lines.length).toBeGreaterThanOrEqual(4)
      }
    }
  })

  it('personLineIndex and locationLineIndex, where present, point at real line indices', () => {
    for (const level of LEVELS) {
      for (const paragraph of MULTI_LINE_PARAGRAPHS[level]) {
        if (paragraph.personLineIndex !== undefined) {
          expect(paragraph.personLineIndex).toBeGreaterThanOrEqual(0)
          expect(paragraph.personLineIndex).toBeLessThan(paragraph.lines.length)
        }
        if (paragraph.locationLineIndex !== undefined) {
          expect(paragraph.locationLineIndex).toBeGreaterThanOrEqual(0)
          expect(paragraph.locationLineIndex).toBeLessThan(paragraph.lines.length)
        }
      }
    }
  })

  it('every level has at least one person-tagged and one location-tagged paragraph', () => {
    for (const level of LEVELS) {
      expect(MULTI_LINE_PARAGRAPHS[level].some((p) => p.personLineIndex !== undefined)).toBe(true)
      expect(MULTI_LINE_PARAGRAPHS[level].some((p) => p.locationLineIndex !== undefined)).toBe(true)
    }
  })

  it('every level has at least one paragraph containing a real numeral (for number-line)', () => {
    for (const level of LEVELS) {
      const hasNumeral = MULTI_LINE_PARAGRAPHS[level].some((p) => p.lines.some((l) => /\d/.test(l)))
      expect(hasNumeral).toBe(true)
    }
  })
})

describe('getMultiLineParagraphsForLevel', () => {
  it('returns the requested count when enough paragraphs are fresh', () => {
    const paragraphs = getMultiLineParagraphsForLevel(2, 3, new Set(), 1)
    expect(paragraphs).toHaveLength(3)
  })

  it('excludes paragraphs already shown this session, when enough fresh ones remain', () => {
    const used = new Set([MULTI_LINE_PARAGRAPHS[1][0]!.lines[0]!])
    const paragraphs = getMultiLineParagraphsForLevel(1, 5, used, 1)
    for (const p of paragraphs) expect(p.lines[0]).not.toBe(MULTI_LINE_PARAGRAPHS[1][0]!.lines[0])
  })

  it('falls back to the full pool rather than under-filling when exclusion would leave too few', () => {
    const used = new Set(MULTI_LINE_PARAGRAPHS[1].map((p) => p.lines[0]!))
    const paragraphs = getMultiLineParagraphsForLevel(1, 3, used, 1)
    expect(paragraphs).toHaveLength(3)
  })

  it('is deterministic for a given seed', () => {
    const first = getMultiLineParagraphsForLevel(3, 4, new Set(), 42)
    const second = getMultiLineParagraphsForLevel(3, 4, new Set(), 42)
    expect(second).toEqual(first)
  })
})
