import { describe, expect, it } from 'vitest'
import { detectSourceType } from './detectSourceType'

function file(type: string): File {
  return new File([new Uint8Array([1, 2, 3])], 'sample', { type })
}

describe('detectSourceType', () => {
  it('detects PDF', () => {
    expect(detectSourceType(file('application/pdf'))).toBe('pdf')
  })

  it('detects DOCX', () => {
    expect(detectSourceType(file('application/vnd.openxmlformats-officedocument.wordprocessingml.document'))).toBe('docx')
  })

  it('detects legacy DOC', () => {
    expect(detectSourceType(file('application/msword'))).toBe('doc')
  })

  it('detects TXT', () => {
    expect(detectSourceType(file('text/plain'))).toBe('txt')
  })

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])('detects %s as an image', (mimeType) => {
    expect(detectSourceType(file(mimeType))).toBe('image')
  })

  it('returns unknown for an unsupported or unrecognized type', () => {
    expect(detectSourceType(file('application/zip'))).toBe('unknown')
    expect(detectSourceType(file(''))).toBe('unknown')
  })
})
