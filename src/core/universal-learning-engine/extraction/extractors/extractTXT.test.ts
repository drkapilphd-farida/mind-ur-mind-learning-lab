import { describe, expect, it } from 'vitest'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { extractTXT } from './extractTXT'

function makeSource(): UniversalSource {
  return {
    id: 'source-1',
    name: 'notes.txt',
    mimeType: 'text/plain',
    extension: 'txt',
    size: 100,
    language: null,
    sourceType: 'txt',
    status: 'ready',
    uploadedAt: '2026-01-01T00:00:00.000Z',
    metadata: {},
  }
}

describe('extractTXT', () => {
  it('extracts real paragraphs from a real text file', async () => {
    const file = new File(['First paragraph.\n\nSecond paragraph.'], 'notes.txt', { type: 'text/plain' })
    const result = await extractTXT(file, makeSource())
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.paragraphs).toEqual(['First paragraph.', 'Second paragraph.'])
      expect(result.document.sections).toHaveLength(1)
      expect(result.document.sections[0]?.heading).toBeNull()
      expect(result.document.pageCount).toBeNull()
    }
  })

  it('maps an extraction failure to unreadable-document, carrying the real error text', async () => {
    const file = new File([''], 'empty.txt', { type: 'text/plain' })
    const result = await extractTXT(file, makeSource(), async () => ({ success: false, error: 'This text file appears to be empty.' }))
    expect(result).toEqual({ success: false, error: { code: 'unreadable-document', message: 'This text file appears to be empty.' } })
  })

  it('maps whitespace-only content to empty-extraction', async () => {
    const file = new File(['   '], 'blank.txt', { type: 'text/plain' })
    const result = await extractTXT(file, makeSource(), async () => ({ success: true, text: '   ' }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.code).toBe('empty-extraction')
  })
})
