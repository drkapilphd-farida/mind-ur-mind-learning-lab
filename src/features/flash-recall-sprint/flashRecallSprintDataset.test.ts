import { describe, expect, it } from 'vitest'
import {
  FLASH_RECALL_SPRINT_SENTENCES,
  FLASH_RECALL_SPRINT_PASSAGE,
  FLASH_RECALL_SPRINT_WORDS,
  FLASH_RECALL_SPRINT_QUESTIONS,
} from './flashRecallSprintDataset'

describe('FLASH_RECALL_SPRINT_PASSAGE', () => {
  it('is a single continuous passage built from all the real hand-authored sentences', () => {
    for (const sentence of FLASH_RECALL_SPRINT_SENTENCES) {
      expect(FLASH_RECALL_SPRINT_PASSAGE).toContain(sentence)
    }
  })

  it('has no empty sentences', () => {
    for (const sentence of FLASH_RECALL_SPRINT_SENTENCES) {
      expect(sentence.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('FLASH_RECALL_SPRINT_WORDS', () => {
  it('splits the passage into true single-word RSVP units', () => {
    expect(FLASH_RECALL_SPRINT_WORDS.length).toBeGreaterThan(0)
    for (const word of FLASH_RECALL_SPRINT_WORDS) {
      // A genuine single-word unit never contains whitespace.
      expect(word.trim()).toBe(word)
      expect(word.length).toBeGreaterThan(0)
      expect(/\s/.test(word)).toBe(false)
    }
  })

  it('reassembles back into the exact original passage when joined with spaces', () => {
    expect(FLASH_RECALL_SPRINT_WORDS.join(' ')).toBe(FLASH_RECALL_SPRINT_PASSAGE)
  })
})

describe('FLASH_RECALL_SPRINT_QUESTIONS', () => {
  it('has exactly 3 post-session comprehension questions', () => {
    expect(FLASH_RECALL_SPRINT_QUESTIONS.length).toBe(3)
  })

  it('gives every question exactly 4 options and a valid correct-answer index', () => {
    for (const question of FLASH_RECALL_SPRINT_QUESTIONS) {
      expect(question.options.length).toBe(4)
      expect(question.correctOptionIndex).toBeGreaterThanOrEqual(0)
      expect(question.correctOptionIndex).toBeLessThanOrEqual(3)
      expect(question.question.trim().length).toBeGreaterThan(0)
      expect(new Set(question.options).size).toBe(question.options.length)
    }
  })

  it('gives every question a unique id', () => {
    const ids = new Set(FLASH_RECALL_SPRINT_QUESTIONS.map((question) => question.id))
    expect(ids.size).toBe(FLASH_RECALL_SPRINT_QUESTIONS.length)
  })
})
