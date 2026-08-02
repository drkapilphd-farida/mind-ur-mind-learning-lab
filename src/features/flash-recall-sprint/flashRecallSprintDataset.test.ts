import { describe, expect, it } from 'vitest'
import { FLASH_RECALL_SPRINT_ROUNDS } from './flashRecallSprintDataset'

describe('FLASH_RECALL_SPRINT_ROUNDS', () => {
  it('produces at least one round', () => {
    expect(FLASH_RECALL_SPRINT_ROUNDS.length).toBeGreaterThan(0)
  })

  it('gives every round a unique id', () => {
    const ids = new Set(FLASH_RECALL_SPRINT_ROUNDS.map((round) => round.id))
    expect(ids.size).toBe(FLASH_RECALL_SPRINT_ROUNDS.length)
  })

  it('keeps every passage at exactly 12 words, so the settings WPM band reliably yields a 3-5s flash', () => {
    for (const round of FLASH_RECALL_SPRINT_ROUNDS) {
      const wordCount = round.passage.trim().split(/\s+/).filter(Boolean).length
      expect(wordCount).toBe(12)
    }
  })

  it('gives every question a correctOptionId that matches one of its own options', () => {
    for (const round of FLASH_RECALL_SPRINT_ROUNDS) {
      const optionIds = round.question.options.map((option) => option.id)
      expect(optionIds).toContain(round.question.correctOptionId)
    }
  })

  it('gives every question a unique id across the dataset', () => {
    const questionIds = new Set(FLASH_RECALL_SPRINT_ROUNDS.map((round) => round.question.id))
    expect(questionIds.size).toBe(FLASH_RECALL_SPRINT_ROUNDS.length)
  })
})
