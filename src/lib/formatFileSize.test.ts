import { describe, expect, it } from 'vitest'
import { formatFileSize } from './formatFileSize'

describe('formatFileSize', () => {
  it('formats real sub-kilobyte sizes in bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('formats real sub-megabyte sizes in whole kilobytes', () => {
    expect(formatFileSize(20 * 1024)).toBe('20 KB')
  })

  it('formats real megabyte-and-above sizes to one decimal place', () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
  })
})
