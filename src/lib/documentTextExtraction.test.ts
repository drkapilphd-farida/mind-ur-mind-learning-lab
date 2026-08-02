import { describe, expect, it } from 'vitest'
import { extractTextFromDocx, extractTextFromTxt } from './documentTextExtraction'

describe('extractTextFromTxt', () => {
  it('reads real text content from a .txt file', async () => {
    const file = new File(['These are my real study notes about photosynthesis.'], 'notes.txt', { type: 'text/plain' })
    const result = await extractTextFromTxt(file)
    expect(result).toEqual({ success: true, text: 'These are my real study notes about photosynthesis.' })
  })

  it('fails honestly for an empty text file', async () => {
    const file = new File([''], 'empty.txt', { type: 'text/plain' })
    const result = await extractTextFromTxt(file)
    expect(result.success).toBe(false)
  })
})

describe('extractTextFromDocx', () => {
  it('fails honestly (does not crash) on a file that is not really a .docx', async () => {
    const file = new File([new Uint8Array([0x00, 0x01, 0x02, 0x03])], 'fake.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const result = await extractTextFromDocx(file)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.length).toBeGreaterThan(0)
    }
  })
})
