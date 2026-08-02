import { describe, expect, it } from 'vitest'
import { localSprintContentProvider } from './localSprintContentProvider'

describe('localSprintContentProvider', () => {
  it('returns real text items for Word Sprint, never exceeding the real target count', () => {
    const items = localSprintContentProvider.getItems('word', 'medium', { targetCount: 30 })
    expect(items.length).toBeGreaterThan(0)
    expect(items.length).toBeLessThanOrEqual(30)
    expect(items.every((item) => item.kind === 'text')).toBe(true)
  })

  it('never returns real duplicate text within one real call', () => {
    const items = localSprintContentProvider.getItems('phrase', 'medium', { targetCount: 25 })
    const texts = items.map((item) => (item.kind === 'text' ? item.text.toLowerCase() : ''))
    expect(new Set(texts).size).toBe(texts.length)
  })

  it('pools sentences across real tiers when a single tier is too thin, honestly under-filling rather than repeating', () => {
    const items = localSprintContentProvider.getItems('sentence', 'expert', { targetCount: 18 })
    const texts = items.map((item) => (item.kind === 'text' ? item.text.toLowerCase() : ''))
    expect(new Set(texts).size).toBe(texts.length)
    expect(items.length).toBeGreaterThan(0)
  })

  it('FIX-20 — Paragraph Sprint is pure reading, never embeds real questions', () => {
    const items = localSprintContentProvider.getItems('paragraph', 'medium', { targetCount: 4 })
    expect(items.length).toBeGreaterThan(0)
    expect(items.every((item) => item.kind === 'text')).toBe(true)
  })

  it('returns real question items for Reading Understanding, never text', () => {
    const items = localSprintContentProvider.getItems('meaning', 'medium', { targetCount: 5 })
    expect(items.length).toBeGreaterThan(0)
    expect(items.every((item) => item.kind === 'question')).toBe(true)
  })

  it('is deterministic-shaped — every real question has a real prompt and at least 2 real options', () => {
    const items = localSprintContentProvider.getItems('meaning', 'easy', { targetCount: 5 })
    for (const item of items) {
      if (item.kind !== 'question') continue
      expect(item.question.prompt.length).toBeGreaterThan(0)
      expect(item.question.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('FIX-16 — every real question carries a real, internal correctOptionId matching one of its own options', () => {
    const items = localSprintContentProvider.getItems('meaning', 'easy', { targetCount: 5 })
    for (const item of items) {
      if (item.kind !== 'question') continue
      expect(item.question.options.some((option) => option.id === item.question.correctOptionId)).toBe(true)
    }
  })

  it('FIX-03 — Reading Understanding never asks a real question about a real paragraph already read earlier in the session', () => {
    const paragraphItems = localSprintContentProvider.getItems('paragraph', 'medium', { targetCount: 4 })
    const usedIds = paragraphItems.map((item) => item.id)

    const meaningItems = localSprintContentProvider.getItems('meaning', 'medium', { targetCount: 5, excludeIds: usedIds })

    const meaningIds = meaningItems.map((item) => item.id)
    expect(meaningIds.some((id) => usedIds.includes(id))).toBe(false)
  })
})
