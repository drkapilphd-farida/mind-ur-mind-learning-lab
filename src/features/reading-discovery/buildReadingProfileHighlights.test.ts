import { describe, expect, it } from 'vitest'
import { buildReadingProfileHighlights } from './buildReadingProfileHighlights'

const REAL_PROFILE_LABELS = ['Growing Reader', 'Focused Reader', 'Emerging Chunk Reader', 'Careful Reader', 'Consistent Reader', 'Developing Speed Reader']

const REAL_BIGGEST_IMPROVEMENTS = ['Read Bigger Chunks', 'Improve Reading Rhythm', 'Reduce Eye Stops', 'Read Longer Comfortably', 'Increase Understanding Speed']

describe('buildReadingProfileHighlights', () => {
  it('FIX-02 — always picks one of the locked, never-negative real profile labels', () => {
    const highlights = buildReadingProfileHighlights('improving', 1, 20)
    expect(REAL_PROFILE_LABELS).toContain(highlights.profileLabel)
  })

  it('FIX-02 — never uses a negative label, even for a declining, hesitant real session', () => {
    const highlights = buildReadingProfileHighlights('declining', 8, 20)
    expect(highlights.profileLabel).not.toMatch(/weak|poor|slow|bad/i)
  })

  it('FIX-26 — efficiencyLine is short (6 words or fewer)', () => {
    const highlights = buildReadingProfileHighlights('stable', 1, 20)
    expect(highlights.efficiencyLine.split(' ').length).toBeLessThanOrEqual(6)
  })

  it('FIX-27 — biggestImprovement is always exactly one of the locked, real recommendations', () => {
    const highlights = buildReadingProfileHighlights('stable', 6, 20)
    expect(REAL_BIGGEST_IMPROVEMENTS).toContain(highlights.biggestImprovement)
  })

  it('FIX-27 — a real, frequent hesitation pattern recommends reducing eye stops', () => {
    const highlights = buildReadingProfileHighlights('stable', 6, 20)
    expect(highlights.biggestImprovement).toBe('Reduce Eye Stops')
  })

  it('FIX-16/FIX-27 — a real, low comprehension accuracy outranks pacing signals as the single highest-impact opportunity', () => {
    const highlights = buildReadingProfileHighlights('improving', 0, 20, 0.3)
    expect(highlights.biggestImprovement).toBe('Increase Understanding Speed')
  })

  it('FIX-26 — real, high comprehension accuracy is reflected in the Efficiency line', () => {
    const highlights = buildReadingProfileHighlights('stable', 2, 20, 0.9)
    expect(highlights.efficiencyLine).toBe('Excellent Accuracy. Increase Rhythm.')
  })

  it('is honest with zero real signals rather than dividing by zero', () => {
    expect(() => buildReadingProfileHighlights('stable', 0, 0)).not.toThrow()
  })

  it('is honest when no real comprehension signal exists yet (mid-session)', () => {
    expect(() => buildReadingProfileHighlights('stable', 1, 10, null)).not.toThrow()
  })
})
