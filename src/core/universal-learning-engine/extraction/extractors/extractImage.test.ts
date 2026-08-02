import { describe, expect, it } from 'vitest'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { extractImage } from './extractImage'

function makeSource(mimeType = 'image/png'): UniversalSource {
  return {
    id: 'source-1',
    name: 'handwritten-notes.png',
    mimeType,
    extension: 'png',
    size: 100,
    language: null,
    sourceType: 'image',
    status: 'ready',
    uploadedAt: '2026-01-01T00:00:00.000Z',
    metadata: {},
  }
}

function makeFile(mimeType = 'image/png'): File {
  return new File([new Uint8Array([1, 2, 3])], 'handwritten-notes.png', { type: mimeType })
}

describe('extractImage', () => {
  it('transcribes real Claude vision output into one heading-less section', async () => {
    const result = await extractImage(makeFile(), makeSource(), async () => ({ text: 'First line of notes.\n\nSecond paragraph of notes.' }))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections).toEqual([
        { id: 'section-0', heading: null, blocks: [{ type: 'paragraph', text: 'First line of notes.' }, { type: 'paragraph', text: 'Second paragraph of notes.' }] },
      ])
      expect(result.document.metadata.extractionMethod).toBe('claude-vision')
    }
  })

  it('maps the NO_TEXT_FOUND sentinel to empty-extraction, never fabricating content', async () => {
    const result = await extractImage(makeFile(), makeSource(), async () => ({ text: 'NO_TEXT_FOUND' }))
    expect(result).toEqual({
      success: false,
      error: { code: 'empty-extraction', message: 'No readable text was found in this image.' },
    })
  })

  it('rejects unsupported image formats (e.g. webp/heic) honestly rather than mis-encoding them', async () => {
    const result = await extractImage(makeFile('image/webp'), makeSource('image/webp'), async () => ({ text: 'should never be called' }))
    expect(result).toEqual({
      success: false,
      error: { code: 'unsupported-encoding', message: 'This image format is not supported yet — please upload a PNG or JPEG.' },
    })
  })

  it('maps a callClaudeVision throw (missing API key, network failure, etc.) to extraction-failed', async () => {
    const result = await extractImage(makeFile(), makeSource(), async () => {
      throw new Error('boom')
    })
    expect(result).toEqual({
      success: false,
      error: { code: 'extraction-failed', message: 'We could not read the text in this image. Please try again.' },
    })
  })
})
