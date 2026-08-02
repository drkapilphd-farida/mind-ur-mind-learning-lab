import { describe, it, expect } from 'vitest'
import {
  generateStimulusTypeSequence,
  buildMixedFlashSession,
  computeStimulusBreakdown,
  findWeakestStimulusType,
  findStrongestStimulusType,
  type MixedFlashStimulusType,
  type StimulusTypeBreakdown,
} from './mixedFlashEngine'
// Registers the word/number/symbol datasets these tests draw from
import './wordFlashDataset'
import './numberFlashDataset'
import './symbolFlashDataset'

describe('generateStimulusTypeSequence', () => {
  it('produces exactly the requested number of items, all valid types', () => {
    const sequence = generateStimulusTypeSequence(20, 'beginner', 1)
    expect(sequence).toHaveLength(20)
    for (const type of sequence) {
      expect(['word', 'number', 'symbol']).toContain(type)
    }
  })

  it('is deterministic for a given seed', () => {
    const first = generateStimulusTypeSequence(20, 'medium', 42)
    const second = generateStimulusTypeSequence(20, 'medium', 42)
    expect(second).toEqual(first)
  })

  it('is word-heavy at Beginner ("mostly words, few numbers, few symbols")', () => {
    // Average the type distribution across many seeds so this isn't
    // sensitive to any single unlucky roll.
    const counts: Record<MixedFlashStimulusType, number> = { word: 0, number: 0, symbol: 0 }
    for (let seed = 0; seed < 50; seed++) {
      for (const type of generateStimulusTypeSequence(20, 'beginner', seed * 1000)) counts[type]++
    }
    const total = counts.word + counts.number + counts.symbol
    expect(counts.word / total).toBeGreaterThan(0.5)
  })

  it('is roughly balanced at Intermediate (medium tier)', () => {
    const counts: Record<MixedFlashStimulusType, number> = { word: 0, number: 0, symbol: 0 }
    for (let seed = 0; seed < 50; seed++) {
      for (const type of generateStimulusTypeSequence(20, 'medium', seed * 1000)) counts[type]++
    }
    const total = counts.word + counts.number + counts.symbol
    // No single type should dominate the way it does at Beginner
    expect(counts.word / total).toBeLessThan(0.5)
  })

  it('switches type more often at Advanced/Master than at Beginner/Intermediate', () => {
    function switchRate(tier: 'beginner' | 'advanced', trials: number): number {
      let switches = 0
      let totalTransitions = 0
      for (let seed = 0; seed < trials; seed++) {
        const seq = generateStimulusTypeSequence(20, tier, seed * 777)
        for (let i = 1; i < seq.length; i++) {
          totalTransitions++
          if (seq[i] !== seq[i - 1]) switches++
        }
      }
      return switches / totalTransitions
    }
    const beginnerRate = switchRate('beginner', 30)
    const advancedRate = switchRate('advanced', 30)
    expect(advancedRate).toBeGreaterThan(beginnerRate)
  })
})

describe('buildMixedFlashSession', () => {
  const emptyExclusions = { word: new Set<string>(), number: new Set<string>(), symbol: new Set<string>() }

  it('builds a full session of real SessionItems, each traceable to a stimulus type', () => {
    const { items, itemTypes } = buildMixedFlashSession({
      tier: 'beginner',
      itemCount: 20,
      seed: 5,
      recentlyShownByType: emptyExclusions,
    })
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.options).toHaveLength(4)
      expect(new Set(item.options).size).toBe(4)
      expect(item.options[item.correctIndex]).toBe(item.stimulus)
      expect(itemTypes.has(item.id)).toBe(true)
      expect(['word', 'number', 'symbol']).toContain(itemTypes.get(item.id))
    }
  })

  it('is deterministic for a given seed', () => {
    const first = buildMixedFlashSession({ tier: 'medium', itemCount: 20, seed: 99, recentlyShownByType: emptyExclusions })
    const second = buildMixedFlashSession({ tier: 'medium', itemCount: 20, seed: 99, recentlyShownByType: emptyExclusions })
    expect(second.items).toEqual(first.items)
  })

  it('produces IDs unique within a session', () => {
    const { items } = buildMixedFlashSession({ tier: 'medium', itemCount: 20, seed: 7, recentlyShownByType: emptyExclusions })
    const ids = items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('never repeats the exact same stimulus twice within one session', () => {
    const { items } = buildMixedFlashSession({ tier: 'beginner', itemCount: 20, seed: 13, recentlyShownByType: emptyExclusions })
    const stimuli = items.map((i) => i.stimulus)
    expect(new Set(stimuli).size).toBe(stimuli.length)
  })
})

describe('computeStimulusBreakdown / findWeakestStimulusType / findStrongestStimulusType', () => {
  const itemTypes = new Map<string, MixedFlashStimulusType>([
    ['w1', 'word'], ['w2', 'word'], ['w3', 'word'],
    ['n1', 'number'], ['n2', 'number'],
    ['s1', 'symbol'], ['s2', 'symbol'],
  ])
  const responses = [
    { itemId: 'w1', isCorrect: true }, { itemId: 'w2', isCorrect: true }, { itemId: 'w3', isCorrect: true },
    { itemId: 'n1', isCorrect: false }, { itemId: 'n2', isCorrect: false },
    { itemId: 's1', isCorrect: true }, { itemId: 's2', isCorrect: false },
  ]

  it('tallies correct/total per stimulus type from the response log', () => {
    const breakdown = computeStimulusBreakdown(responses, itemTypes)
    expect(breakdown.word).toEqual({ correct: 3, total: 3 })
    expect(breakdown.number).toEqual({ correct: 0, total: 2 })
    expect(breakdown.symbol).toEqual({ correct: 1, total: 2 })
  })

  it('identifies numbers as the weakest type (0% accuracy) and words as strongest (100%)', () => {
    const breakdown = computeStimulusBreakdown(responses, itemTypes)
    expect(findWeakestStimulusType(breakdown)).toBe('number')
    expect(findStrongestStimulusType(breakdown)).toBe('word')
  })

  it('ignores types with fewer than 2 samples as not meaningful', () => {
    const thinBreakdown: StimulusTypeBreakdown = {
      word: { correct: 5, total: 5 },
      number: { correct: 0, total: 1 }, // only 1 sample — not enough to call "weakest"
      symbol: { correct: 3, total: 4 },
    }
    expect(findWeakestStimulusType(thinBreakdown)).toBe('symbol')
  })

  it('returns null when no type has enough samples', () => {
    const noSignal: StimulusTypeBreakdown = {
      word: { correct: 1, total: 1 },
      number: { correct: 0, total: 1 },
      symbol: { correct: 0, total: 0 },
    }
    expect(findWeakestStimulusType(noSignal)).toBeNull()
    expect(findStrongestStimulusType(noSignal)).toBeNull()
  })
})
