import { describe, expect, it } from 'vitest'
import { createResponseFormatter } from './DefaultResponseFormatter'

describe('DefaultResponseFormatter', () => {
  const formatter = createResponseFormatter()

  it('classifies plain content with no markdown syntax as plain-text', () => {
    const result = formatter.format({ content: 'Great job today, keep it up.' })
    expect(result.blocks).toEqual([{ type: 'plain-text', content: 'Great job today, keep it up.' }])
  })

  it('classifies content containing markdown syntax as markdown', () => {
    const result = formatter.format({ content: 'Here is **bold** text.' })
    expect(result.blocks[0]).toEqual({ type: 'markdown', content: 'Here is **bold** text.' })
  })

  it('extracts bullet lines into a separate bullet-list block, alongside the raw text block', () => {
    const content = 'Try these:\n- Practice daily\n- Take breaks'
    const result = formatter.format({ content })
    expect(result.blocks).toContainEqual({ type: 'bullet-list', items: ['Practice daily', 'Take breaks'] })
  })

  it('extracts "Action:" lines into action-item blocks', () => {
    const content = 'Action: Complete today\'s reading exercise'
    const result = formatter.format({ content })
    expect(result.blocks).toContainEqual({ type: 'action-item', label: "Complete today's reading exercise" })
  })

  it('passes cards through 1:1, without inventing any text', () => {
    const result = formatter.format({ content: 'ok', cards: [{ title: 'Tip', body: 'Read for 10 minutes.' }] })
    expect(result.blocks).toContainEqual({ type: 'card', title: 'Tip', body: 'Read for 10 minutes.' })
  })

  it('passes suggestedExerciseIds through 1:1, carrying only the id', () => {
    const result = formatter.format({ content: 'ok', suggestedExerciseIds: ['eye-warm-up'] })
    expect(result.blocks).toContainEqual({ type: 'suggested-exercise', exerciseId: 'eye-warm-up' })
  })

  it('handles content with no bullets/actions/cards/exercises by emitting only the text block', () => {
    const result = formatter.format({ content: 'Plain sentence.' })
    expect(result.blocks).toHaveLength(1)
  })

  it('is deterministic — the same input always produces identical blocks', () => {
    const raw = { content: '- one\n- two', suggestedExerciseIds: ['a'] }
    expect(formatter.format(raw)).toEqual(formatter.format(raw))
  })
})
