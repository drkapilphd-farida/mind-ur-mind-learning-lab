import { describe, it, expect } from 'vitest'
import type { ContentItem, ItemResponse } from '@/types/exercise-engine'
import {
  buildPeripheralFlashItems,
  encodePositionedGroup,
  decodePositionedGroup,
  computeVisualSpan,
  computePeripheralAwarenessScore,
  computeSideBreakdown,
  findWeakerSide,
} from './peripheralFlashEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'
import type { PeripheralPosition } from './peripheralFlashDifficulty'

function word(id: string, content: string, family?: string): ContentItem {
  return {
    id,
    content,
    contentLabel: content,
    difficulty: 'medium',
    locale: 'en',
    ...(family !== undefined ? { metadata: { family } } : {}),
  }
}

describe('encodePositionedGroup / decodePositionedGroup', () => {
  it('round-trips a single positioned word', () => {
    const group = [{ position: 'left' as PeripheralPosition, text: 'focus' }]
    const encoded = encodePositionedGroup(group)
    expect(encoded).toBe('left: focus')
    expect(decodePositionedGroup(encoded)).toEqual(group)
  })

  it('round-trips a multi-word group, and reads naturally as speech', () => {
    const group = [
      { position: 'left' as PeripheralPosition, text: 'focus' },
      { position: 'right' as PeripheralPosition, text: 'learn' },
    ]
    const encoded = encodePositionedGroup(group)
    expect(encoded).toBe('left: focus, right: learn')
    expect(decodePositionedGroup(encoded)).toEqual(group)
  })
})

describe('buildPeripheralFlashItems — single stimulus', () => {
  const pool: ContentItem[] = [
    word('w1', 'focus', 'focus'), word('w2', 'focused', 'focus'), word('w3', 'focusing', 'focus'), word('w4', 'focal', 'focus'),
    word('w5', 'learn'), word('w6', 'read'), word('w7', 'calm'), word('w8', 'brain'),
  ]
  const positions: PeripheralPosition[] = ['left', 'right', 'top', 'bottom']

  it('produces well-formed SessionItems: 4 unique options, correctIndex points at the stimulus', () => {
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 1, allowedPositions: positions, targetCount: 5, seed: 42 })
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.options).toHaveLength(4)
      expect(new Set(item.options).size).toBe(4)
      expect(item.options[item.correctIndex]).toBe(item.stimulus)
      const decoded = decodePositionedGroup(item.stimulus)
      expect(decoded).toHaveLength(1)
      expect(positions).toContain(decoded[0]!.position)
    }
  })

  it('keeps the same position across every distractor — only the word changes', () => {
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 1, allowedPositions: positions, targetCount: 5, seed: 7 })
    for (const item of items) {
      const correctPosition = decodePositionedGroup(item.stimulus)[0]!.position
      for (const option of item.options) {
        const decoded = decodePositionedGroup(option)
        expect(decoded[0]!.position).toBe(correctPosition)
      }
    }
  })

  it('prefers a family-confusable word as distractor when available', () => {
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 1, allowedPositions: positions, targetCount: 8, seed: 3 })
    const focusItem = items.find((i) => decodePositionedGroup(i.stimulus)[0]!.text === 'focus')
    if (focusItem) {
      const words = focusItem.options.map((o) => decodePositionedGroup(o)[0]!.text)
      expect(words.some((w) => ['focused', 'focusing', 'focal'].includes(w))).toBe(true)
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 1, allowedPositions: positions, targetCount: 5, seed: 99 })
    const second = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 1, allowedPositions: positions, targetCount: 5, seed: 99 })
    expect(second).toEqual(first)
  })
})

describe('buildPeripheralFlashItems — multi-stimulus groups', () => {
  const pool: ContentItem[] = [
    word('w1', 'focus'), word('w2', 'learn'), word('w3', 'read'), word('w4', 'calm'),
    word('w5', 'brain'), word('w6', 'speed'), word('w7', 'sharp'), word('w8', 'quick'),
  ]
  const positions: PeripheralPosition[] = ['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']

  it('composes exactly 2 distinct positioned words for stimulusCount 2', () => {
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 2, allowedPositions: positions, targetCount: 4, seed: 11 })
    for (const item of items) {
      const decoded = decodePositionedGroup(item.stimulus)
      expect(decoded).toHaveLength(2)
      expect(new Set(decoded.map((d) => d.position)).size).toBe(2)
      expect(new Set(decoded.map((d) => d.text)).size).toBe(2)
    }
  })

  it('composes exactly 3 distinct positioned words for stimulusCount 3', () => {
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 3, allowedPositions: positions, targetCount: 4, seed: 21 })
    for (const item of items) {
      const decoded = decodePositionedGroup(item.stimulus)
      expect(decoded).toHaveLength(3)
      expect(new Set(decoded.map((d) => d.position)).size).toBe(3)
    }
  })

  it('mixed/adaptive mode varies stimulus count across items', () => {
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 'adaptive', allowedPositions: positions, targetCount: 10, seed: 31 })
    const counts = new Set(items.map((i) => decodePositionedGroup(i.stimulus).length))
    expect(counts.size).toBeGreaterThanOrEqual(2)
  })

  it('never repeats the exact same group within one session', () => {
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 2, allowedPositions: positions, targetCount: 8, seed: 5 })
    const stimuli = items.map((i) => i.stimulus)
    expect(new Set(stimuli).size).toBe(stimuli.length)
  })
})

describe('buildPeripheralFlashItems — edge cases', () => {
  it('returns an empty array for an empty word pool', () => {
    expect(buildPeripheralFlashItems({ wordPool: [], stimulusCount: 1, allowedPositions: ['left'], targetCount: 5, seed: 1 })).toEqual([])
  })

  it('returns an empty array when no positions are allowed', () => {
    const pool = [word('w1', 'focus')]
    expect(buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 1, allowedPositions: [], targetCount: 5, seed: 1 })).toEqual([])
  })

  it('every stimulus and option word is visually valid at the option role', () => {
    const pool: ContentItem[] = [
      word('w1', 'focus'), word('w2', 'learn'), word('w3', 'read'), word('w4', 'calm'), word('w5', 'brain'),
    ]
    const items = buildPeripheralFlashItems({ wordPool: pool, stimulusCount: 1, allowedPositions: ['left', 'right'], targetCount: 5, seed: 9 })
    for (const item of items) {
      for (const option of item.options) {
        for (const { text } of decodePositionedGroup(option)) {
          expect(isVisuallyValid(text, 'option')).toBe(true)
        }
      }
    }
  })
})

describe('computeVisualSpan', () => {
  it('returns 0 for no items', () => {
    expect(computeVisualSpan([])).toBe(0)
  })
  it('averages the stimulus counts across items', () => {
    expect(computeVisualSpan([1, 1, 1, 1])).toBe(1)
    expect(computeVisualSpan([1, 2, 3])).toBe(2)
  })
})

describe('computePeripheralAwarenessScore', () => {
  it('scales with accuracy and rewards a wider visual span', () => {
    const narrowSpan = computePeripheralAwarenessScore(90, 1)
    const wideSpan = computePeripheralAwarenessScore(90, 3)
    expect(wideSpan).toBeGreaterThan(narrowSpan)
  })

  it('never exceeds 100 or drops below 0', () => {
    expect(computePeripheralAwarenessScore(100, 3)).toBeLessThanOrEqual(100)
    expect(computePeripheralAwarenessScore(0, 1)).toBeGreaterThanOrEqual(0)
  })
})

describe('buildPeripheralFlashItems — Level 5 mixed content kinds', () => {
  const wordPool: ContentItem[] = [
    word('w1', 'focus'), word('w2', 'learn'), word('w3', 'read'), word('w4', 'calm'), word('w5', 'brain'),
  ]
  const numberPool: ContentItem[] = [
    { id: 'n1', content: '482', contentLabel: '482', difficulty: 'medium', locale: 'en' },
    { id: 'n2', content: '917', contentLabel: '917', difficulty: 'medium', locale: 'en' },
    { id: 'n3', content: '350', contentLabel: '350', difficulty: 'medium', locale: 'en' },
    { id: 'n4', content: '624', contentLabel: '624', difficulty: 'medium', locale: 'en' },
    { id: 'n5', content: '791', contentLabel: '791', difficulty: 'medium', locale: 'en' },
  ]
  const symbolPool: ContentItem[] = [
    { id: 's1', content: '★', contentLabel: '★', difficulty: 'medium', locale: 'en', metadata: { family: 'star' } },
    { id: 's2', content: '☆', contentLabel: '☆', difficulty: 'medium', locale: 'en', metadata: { family: 'star' } },
    { id: 's3', content: '▲', contentLabel: '▲', difficulty: 'medium', locale: 'en' },
    { id: 's4', content: '#', contentLabel: '#', difficulty: 'medium', locale: 'en' },
    { id: 's5', content: '@', contentLabel: '@', difficulty: 'medium', locale: 'en' },
  ]
  const positions: PeripheralPosition[] = ['left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right']

  it('draws stimuli from words, numbers, and symbols when all three pools are provided', () => {
    const items = buildPeripheralFlashItems({
      wordPool, numberPool, symbolPool, stimulusCount: 3, allowedPositions: positions, targetCount: 12, seed: 55,
    })
    const allTexts = items.flatMap((i) => decodePositionedGroup(i.stimulus).map((g) => g.text))
    const isNumber = (t: string): boolean => /^\d+$/.test(t)
    const isSymbol = (t: string): boolean => symbolPool.some((s) => s.content === t)
    const isWord = (t: string): boolean => wordPool.some((w) => w.content === t)
    expect(allTexts.some(isNumber)).toBe(true)
    expect(allTexts.some(isSymbol)).toBe(true)
    expect(allTexts.some(isWord)).toBe(true)
  })

  it('never swaps a distractor of a different kind than the position’s original content', () => {
    const items = buildPeripheralFlashItems({
      wordPool, numberPool, symbolPool, stimulusCount: 2, allowedPositions: positions, targetCount: 12, seed: 61,
    })
    const isNumber = (t: string): boolean => /^\d+$/.test(t)
    const isSymbol = (t: string): boolean => symbolPool.some((s) => s.content === t)
    const isWord = (t: string): boolean => wordPool.some((w) => w.content === t)
    const kindOf = (t: string): 'number' | 'symbol' | 'word' => (isNumber(t) ? 'number' : isSymbol(t) ? 'symbol' : isWord(t) ? 'word' : 'word')

    for (const item of items) {
      const correctByPosition = new Map(decodePositionedGroup(item.stimulus).map((g) => [g.position, g.text]))
      for (const option of item.options) {
        for (const { position, text } of decodePositionedGroup(option)) {
          const correctText = correctByPosition.get(position)!
          expect(kindOf(text)).toBe(kindOf(correctText))
        }
      }
    }
  })

  it('is word-only (identical to before) when numberPool/symbolPool are omitted', () => {
    const items = buildPeripheralFlashItems({ wordPool, stimulusCount: 1, allowedPositions: ['left', 'right'], targetCount: 5, seed: 42 })
    const allTexts = items.flatMap((i) => decodePositionedGroup(i.stimulus).map((g) => g.text))
    expect(allTexts.every((t) => wordPool.some((w) => w.content === t))).toBe(true)
  })

  // Regression test for a real bug found in live testing: a tight curated
  // symbol family (¢ / ₹ / £ / ¥) supplied all 3 distractors for a single
  // position in a 3-target item, leaving the other two positions'
  // words textually identical across every option — a learner could
  // answer correctly without perceiving those targets at all, defeating
  // the mission's own purpose.
  it('diversifies which position varies across distractors when a 3-target group has multiple candidate-rich positions', () => {
    const richWordPool: ContentItem[] = [
      word('w1', 'sophistication', 'sophistication'), word('w2', 'complication', 'sophistication'),
      word('w3', 'comprehension', 'comprehension'), word('w4', 'apprehension', 'comprehension'),
      word('w5', 'filler1'), word('w6', 'filler2'),
    ]
    const currencySymbols: ContentItem[] = [
      { id: 'c1', content: '¢', contentLabel: '¢', difficulty: 'medium', locale: 'en', metadata: { family: 'currency' } },
      { id: 'c2', content: '₹', contentLabel: '₹', difficulty: 'medium', locale: 'en', metadata: { family: 'currency' } },
      { id: 'c3', content: '£', contentLabel: '£', difficulty: 'medium', locale: 'en', metadata: { family: 'currency' } },
      { id: 'c4', content: '¥', contentLabel: '¥', difficulty: 'medium', locale: 'en', metadata: { family: 'currency' } },
    ]
    const items = buildPeripheralFlashItems({
      wordPool: richWordPool,
      symbolPool: currencySymbols,
      stimulusCount: 3,
      allowedPositions: ['left', 'top', 'top-left'],
      targetCount: 10,
      seed: 17,
    })
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      const correctByPosition = new Map(decodePositionedGroup(item.stimulus).map((g) => [g.position, g.text]))
      const positionsThatVary = new Set<string>()
      for (const option of item.options) {
        for (const { position, text } of decodePositionedGroup(option)) {
          if (text !== correctByPosition.get(position)) positionsThatVary.add(position)
        }
      }
      // With 3 distinct positions each backed by a real candidate pool,
      // at least 2 of the 3 positions should vary somewhere across the
      // distractor set — not just the one richest position.
      expect(positionsThatVary.size).toBeGreaterThanOrEqual(2)
    }
  })
})

function response(itemId: string, isCorrect: boolean): ItemResponse {
  return { itemId, selectedIndex: 0, correctIndex: 0, isCorrect, reactionTimeMs: 400, skipped: false }
}

describe('computeSideBreakdown / findWeakerSide', () => {
  it('only counts items whose positions touch exactly one side', () => {
    const itemStimuli = new Map<string, string>([
      ['a', encodePositionedGroup([{ position: 'left', text: 'focus' }])],
      ['b', encodePositionedGroup([{ position: 'right', text: 'learn' }])],
      // Touches both sides — must be excluded from both totals.
      ['c', encodePositionedGroup([{ position: 'left', text: 'focus' }, { position: 'right', text: 'learn' }])],
      // Pure vertical — touches neither side.
      ['d', encodePositionedGroup([{ position: 'top', text: 'read' }])],
    ])
    const responses = [response('a', true), response('b', false), response('c', true), response('d', true)]
    const breakdown = computeSideBreakdown(responses, itemStimuli)
    expect(breakdown.left).toEqual({ correct: 1, total: 1 })
    expect(breakdown.right).toEqual({ correct: 0, total: 1 })
  })

  it('returns null when there is not enough single-side data on both sides', () => {
    const itemStimuli = new Map<string, string>([
      ['a', encodePositionedGroup([{ position: 'left', text: 'focus' }])],
    ])
    const breakdown = computeSideBreakdown([response('a', false)], itemStimuli)
    expect(findWeakerSide(breakdown)).toBeNull()
  })

  it('returns null on a genuine tie or a small gap — never a false weak-side claim', () => {
    const breakdown = {
      left: { correct: 4, total: 5 },   // 80%
      right: { correct: 4, total: 5 },  // 80% — a tie
    }
    expect(findWeakerSide(breakdown)).toBeNull()

    const smallGap = {
      left: { correct: 4, total: 5 },   // 80%
      right: { correct: 3, total: 4 },  // 75% — 5pt gap, below the 15pt threshold
    }
    expect(findWeakerSide(smallGap)).toBeNull()
  })

  it('names the genuinely weaker side when the gap is real and both sides have enough data', () => {
    const breakdown = {
      left: { correct: 2, total: 5 },   // 40%
      right: { correct: 5, total: 5 },  // 100%
    }
    expect(findWeakerSide(breakdown)).toBe('left')
  })
})
