import { describe, it, expect } from 'vitest'
import { detectStrengths } from './strengthDetectorEngine'
import { buildSession } from './testFixtures'
import type { ReadingDnaTrait } from '../adaptive-intelligence/readingIntelligenceTypes'

function trait(overrides: Partial<ReadingDnaTrait>): ReadingDnaTrait {
  return { dimension: 'reading-style', label: 'Balanced Reader', confidence: 60, ...overrides }
}

describe('detectStrengths', () => {
  it('surfaces a positive DNA trait above the confidence bar', () => {
    const strengths = detectStrengths([trait({ dimension: 'reading-style', label: 'Fast Reader', confidence: 70 })], [])
    expect(strengths.some((s) => s.label === 'Fast Reader')).toBe(true)
  })

  it('does not surface a trait below the confidence bar', () => {
    const strengths = detectStrengths([trait({ dimension: 'reading-style', label: 'Fast Reader', confidence: 20 })], [])
    expect(strengths.some((s) => s.label === 'Fast Reader')).toBe(false)
  })

  it('does not frame a non-positive DNA label as a strength', () => {
    const strengths = detectStrengths([trait({ dimension: 'focus-pattern', label: 'Needs Focus Training', confidence: 80 })], [])
    expect(strengths.some((s) => s.label === 'Needs Focus Training')).toBe(false)
  })

  it('always surfaces category-preference as "Strong in X" above the bar', () => {
    const strengths = detectStrengths([trait({ dimension: 'category-preference', label: 'Science', confidence: 60 })], [])
    expect(strengths.some((s) => s.label === 'Strong in Science')).toBe(true)
  })

  it('adds Strong Accuracy from recent session-level data', () => {
    const recent = [buildSession({ accuracyPercent: 95 }), buildSession({ accuracyPercent: 92 })]
    const strengths = detectStrengths([], recent)
    expect(strengths.some((s) => s.id === 'strong-accuracy')).toBe(true)
  })

  it('adds Excellent Comprehension from recent session-level data', () => {
    const recent = [buildSession({ comprehensionPercent: 95 })]
    const strengths = detectStrengths([], recent)
    expect(strengths.some((s) => s.id === 'excellent-comprehension')).toBe(true)
  })

  it('returns an empty list with no DNA traits and no session history', () => {
    expect(detectStrengths([], [])).toHaveLength(0)
  })
})
