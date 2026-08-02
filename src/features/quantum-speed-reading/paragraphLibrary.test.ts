import { describe, it, expect } from 'vitest'
import { PARAGRAPH_LIBRARY, getParagraphForLevel, PARAGRAPH_TOPIC_NAME } from './paragraphLibrary'
import type { ParagraphReadingLevel } from './paragraphDifficulty'

const LEVELS: ParagraphReadingLevel[] = [1, 2, 3, 4, 5]

describe('PARAGRAPH_LIBRARY', () => {
  it('ships exactly 5 paragraphs per level (25 total) — the disclosed scope', () => {
    for (const level of LEVELS) {
      expect(PARAGRAPH_LIBRARY[level]).toHaveLength(5)
    }
  })

  it('every paragraph has a unique id across the whole library', () => {
    const ids = LEVELS.flatMap((level) => PARAGRAPH_LIBRARY[level].map((p) => p.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every paragraph reports the level it is stored under', () => {
    for (const level of LEVELS) {
      for (const paragraph of PARAGRAPH_LIBRARY[level]) {
        expect(paragraph.level).toBe(level)
      }
    }
  })

  it('word counts rise roughly with level (never a shorter paragraph at a higher level)', () => {
    const avgWordCountByLevel = LEVELS.map(
      (level) => PARAGRAPH_LIBRARY[level].reduce((sum, p) => sum + p.wordCount, 0) / PARAGRAPH_LIBRARY[level].length,
    )
    for (let i = 1; i < avgWordCountByLevel.length; i++) {
      expect(avgWordCountByLevel[i]).toBeGreaterThan(avgWordCountByLevel[i - 1]!)
    }
  })

  it('every line stays within a comfortable single-line word range for a 700-760px reading column', () => {
    for (const level of LEVELS) {
      for (const paragraph of PARAGRAPH_LIBRARY[level]) {
        for (const line of paragraph.lines) {
          const words = line.trim().split(/\s+/).filter(Boolean).length
          expect(words).toBeGreaterThanOrEqual(4)
          expect(words).toBeLessThanOrEqual(20)
        }
      }
    }
  })

  it('every 8-field-group\'s distractors are real (non-empty, distinct from the correct answer)', () => {
    for (const level of LEVELS) {
      for (const p of PARAGRAPH_LIBRARY[level]) {
        expect(p.mainIdea.distractors).not.toContain(p.mainIdea.correctIdea)
        expect(p.supportingDetail.distractors).not.toContain(p.supportingDetail.correctDetail)
        expect(p.inference.distractors).not.toContain(p.inference.correctInference)
        expect(p.causeEffect.distractors).not.toContain(p.causeEffect.cause)
        expect(p.vocabularyInContext.distractors).not.toContain(p.vocabularyInContext.contextualMeaning)
        expect(p.bestTitle.distractorTitles).not.toContain(p.title)
        expect(p.summarySelection.distractors).not.toContain(p.summarySelection.correctSummary)
        expect(p.meaningRelationship.distractors).not.toContain(p.meaningRelationship.correctRelationshipStatement)
        for (const group of [p.mainIdea, p.supportingDetail, p.inference, p.causeEffect, p.vocabularyInContext, p.summarySelection, p.meaningRelationship]) {
          expect(group.distractors).toHaveLength(3)
        }
        expect(p.bestTitle.distractorTitles).toHaveLength(3)
      }
    }
  })

  it('lineIndex/lineIndexA/lineIndexB fields always point at a real authored line', () => {
    for (const level of LEVELS) {
      for (const p of PARAGRAPH_LIBRARY[level]) {
        expect(p.supportingDetail.lineIndex).toBeGreaterThanOrEqual(0)
        expect(p.supportingDetail.lineIndex).toBeLessThan(p.lines.length)
        expect(p.causeEffect.lineIndex).toBeGreaterThanOrEqual(0)
        expect(p.causeEffect.lineIndex).toBeLessThan(p.lines.length)
        expect(p.vocabularyInContext.lineIndex).toBeGreaterThanOrEqual(0)
        expect(p.vocabularyInContext.lineIndex).toBeLessThan(p.lines.length)
        expect(p.meaningRelationship.lineIndexA).toBeGreaterThanOrEqual(0)
        expect(p.meaningRelationship.lineIndexA).toBeLessThan(p.lines.length)
        expect(p.meaningRelationship.lineIndexB).toBeGreaterThanOrEqual(0)
        expect(p.meaningRelationship.lineIndexB).toBeLessThan(p.lines.length)
      }
    }
  })

  it('the vocabulary word actually appears in its referenced line', () => {
    for (const level of LEVELS) {
      for (const p of PARAGRAPH_LIBRARY[level]) {
        const line = p.lines[p.vocabularyInContext.lineIndex]!.toLowerCase()
        expect(line).toContain(p.vocabularyInContext.word.toLowerCase())
      }
    }
  })

  it('every topic used has a display name', () => {
    for (const level of LEVELS) {
      for (const p of PARAGRAPH_LIBRARY[level]) {
        expect(PARAGRAPH_TOPIC_NAME[p.topic]).toBeTruthy()
      }
    }
  })
})

describe('getParagraphForLevel', () => {
  it('prefers a paragraph not already used this session', () => {
    const pool = PARAGRAPH_LIBRARY[1]
    const excludeIds = new Set(pool.slice(0, 4).map((p) => p.id))
    const picked = getParagraphForLevel(1, excludeIds, 7)
    expect(picked.id).toBe(pool[4]!.id)
  })

  it('falls back to reuse rather than fail once the pool is exhausted', () => {
    const pool = PARAGRAPH_LIBRARY[1]
    const excludeIds = new Set(pool.map((p) => p.id))
    const picked = getParagraphForLevel(1, excludeIds, 3)
    expect(pool.map((p) => p.id)).toContain(picked.id)
  })

  it('is deterministic for a given seed', () => {
    const a = getParagraphForLevel(2, new Set(), 42)
    const b = getParagraphForLevel(2, new Set(), 42)
    expect(a.id).toBe(b.id)
  })
})
