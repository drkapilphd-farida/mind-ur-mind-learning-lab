import { describe, it, expect } from 'vitest'
import { getComprehensionQuestions } from './comprehensionQuestions'
import { PASSAGE_LIBRARY } from './passageLibrary'

const RESPONSE_FORMATS = ['single-choice', 'true-false', 'multi-select', 'ordering']
const QUESTION_TYPES = ['main-idea', 'key-detail', 'sequence', 'cause-effect', 'vocabulary', 'inference']

describe('comprehension question coverage', () => {
  it('every real passage in the library has a matching question set', () => {
    for (const passage of PASSAGE_LIBRARY) {
      const set = getComprehensionQuestions(passage.id)
      expect(set, `missing question set for ${passage.id}`).not.toBeNull()
    }
  })

  it('every question set has exactly 5 questions', () => {
    for (const passage of PASSAGE_LIBRARY) {
      const set = getComprehensionQuestions(passage.id)
      expect(set?.questions).toHaveLength(5)
    }
  })

  it('returns null for an unknown passage id rather than throwing', () => {
    expect(getComprehensionQuestions('not-a-real-passage')).toBeNull()
  })
})

describe('comprehension question data integrity', () => {
  for (const passage of PASSAGE_LIBRARY) {
    const set = getComprehensionQuestions(passage.id)
    if (!set) continue

    describe(passage.id, () => {
      it('has unique question ids', () => {
        const ids = set.questions.map((q) => q.id)
        expect(new Set(ids).size).toBe(ids.length)
      })

      it('every question has a non-empty prompt and explanation', () => {
        for (const q of set.questions) {
          expect(q.prompt.length).toBeGreaterThan(0)
          expect(q.explanation.length).toBeGreaterThan(0)
        }
      })

      it('every question has a valid type and format', () => {
        for (const q of set.questions) {
          expect(QUESTION_TYPES).toContain(q.type)
          expect(RESPONSE_FORMATS).toContain(q.format)
        }
      })

      it('every question has at least 2 options', () => {
        for (const q of set.questions) {
          expect(q.options.length).toBeGreaterThanOrEqual(2)
        }
      })

      it('single-choice/true-false questions have a valid correctIndex within bounds', () => {
        for (const q of set.questions) {
          if (q.format === 'single-choice' || q.format === 'true-false') {
            expect(q.correctIndex).toBeDefined()
            expect(q.correctIndex as number).toBeGreaterThanOrEqual(0)
            expect(q.correctIndex as number).toBeLessThan(q.options.length)
          }
        }
      })

      it('multi-select questions have at least 2 valid correctIndices, all within bounds', () => {
        for (const q of set.questions) {
          if (q.format === 'multi-select') {
            expect(q.correctIndices).toBeDefined()
            const indices = q.correctIndices ?? []
            expect(indices.length).toBeGreaterThanOrEqual(2)
            for (const i of indices) {
              expect(i).toBeGreaterThanOrEqual(0)
              expect(i).toBeLessThan(q.options.length)
            }
          }
        }
      })

      it('ordering questions have a correctOrder that is a valid permutation of all option indices', () => {
        for (const q of set.questions) {
          if (q.format === 'ordering') {
            expect(q.correctOrder).toBeDefined()
            const order = q.correctOrder ?? []
            expect(order).toHaveLength(q.options.length)
            const sorted = [...order].sort((a, b) => a - b)
            expect(sorted).toEqual(q.options.map((_, i) => i))
          }
        }
      })

      it('main-idea, key-detail, vocabulary, and inference all appear among the 5 questions', () => {
        const types = set.questions.map((q) => q.type)
        expect(types).toContain('main-idea')
        expect(types).toContain('key-detail')
        expect(types).toContain('vocabulary')
        expect(types).toContain('inference')
      })

      it("the 5th question type is either 'sequence' or 'cause-effect'", () => {
        const types = set.questions.map((q) => q.type)
        const hasSequenceOrCauseEffect = types.includes('sequence') || types.includes('cause-effect')
        expect(hasSequenceOrCauseEffect).toBe(true)
      })
    })
  }
})

describe('response format coverage across the corpus', () => {
  it('every response format is used by at least one question somewhere in the library', () => {
    const usedFormats = new Set<string>()
    for (const passage of PASSAGE_LIBRARY) {
      const set = getComprehensionQuestions(passage.id)
      set?.questions.forEach((q) => usedFormats.add(q.format))
    }
    for (const format of RESPONSE_FORMATS) {
      expect(usedFormats.has(format), `${format} is never used`).toBe(true)
    }
  })
})
