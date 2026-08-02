import { describe, it, expect } from 'vitest'
import {
  computeLiveWpm,
  formatElapsedTime,
  estimateRemainingSec,
  computeReadingProgressPercent,
  wordsReadThroughLine,
} from './readingSessionEngine'

describe('computeLiveWpm', () => {
  it('computes real WPM from words and elapsed time', () => {
    expect(computeLiveWpm(200, 60_000)).toBe(200)
    expect(computeLiveWpm(100, 60_000)).toBe(100)
  })

  it('returns 0 for zero/negative inputs rather than dividing by zero', () => {
    expect(computeLiveWpm(0, 60_000)).toBe(0)
    expect(computeLiveWpm(200, 0)).toBe(0)
    expect(computeLiveWpm(-5, 60_000)).toBe(0)
  })
})

describe('formatElapsedTime', () => {
  it('formats minutes and seconds with zero-padding', () => {
    expect(formatElapsedTime(0)).toBe('0:00')
    expect(formatElapsedTime(5_000)).toBe('0:05')
    expect(formatElapsedTime(65_000)).toBe('1:05')
    expect(formatElapsedTime(154_000)).toBe('2:34')
  })
})

describe('estimateRemainingSec', () => {
  it('computes remaining time from remaining words and current pace', () => {
    expect(estimateRemainingSec(200, 200)).toBe(60)
  })

  it('returns 0 when wpm or remaining words is not positive', () => {
    expect(estimateRemainingSec(0, 200)).toBe(0)
    expect(estimateRemainingSec(200, 0)).toBe(0)
  })
})

describe('computeReadingProgressPercent', () => {
  it('computes a 0-100 percent from scroll position', () => {
    expect(computeReadingProgressPercent(0, 1000, 500)).toBe(0)
    expect(computeReadingProgressPercent(250, 1000, 500)).toBe(50)
    expect(computeReadingProgressPercent(500, 1000, 500)).toBe(100)
  })

  it('returns 100 when content does not overflow the viewport', () => {
    expect(computeReadingProgressPercent(0, 400, 500)).toBe(100)
  })

  it('clamps to [0, 100]', () => {
    expect(computeReadingProgressPercent(-50, 1000, 500)).toBe(0)
    expect(computeReadingProgressPercent(9999, 1000, 500)).toBe(100)
  })
})

describe('wordsReadThroughLine', () => {
  const lines = ['one two three', 'four five', 'six']

  it('sums word counts through the given index, inclusive', () => {
    expect(wordsReadThroughLine(lines, 0)).toBe(3)
    expect(wordsReadThroughLine(lines, 1)).toBe(5)
    expect(wordsReadThroughLine(lines, 2)).toBe(6)
  })

  it('does not overrun the array for an out-of-range index', () => {
    expect(wordsReadThroughLine(lines, 10)).toBe(6)
  })
})
