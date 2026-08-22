import { describe, expect, it } from 'vitest'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { extractImage, extractImages } from './extractImage'

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

describe('extractImages', () => {
  function makeFiles(count: number): File[] {
    return Array.from({ length: count }, (_, index) => new File([new Uint8Array([1, 2, 3])], `page-${index + 1}.png`, { type: 'image/png' }))
  }

  it('transcribes every page in order into its own Page N section, concatenated in order', async () => {
    const files = makeFiles(3)
    let callIndex = 0
    const result = await extractImages(files, makeSource(), async () => {
      callIndex += 1
      return { text: `Content of page ${callIndex}.` }
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections).toEqual([
        { id: 'section-0', heading: 'Page 1', blocks: [{ type: 'paragraph', text: 'Content of page 1.' }] },
        { id: 'section-1', heading: 'Page 2', blocks: [{ type: 'paragraph', text: 'Content of page 2.' }] },
        { id: 'section-2', heading: 'Page 3', blocks: [{ type: 'paragraph', text: 'Content of page 3.' }] },
      ])
      expect(result.document.content).toBe('Content of page 1.\n\nContent of page 2.\n\nContent of page 3.')
      expect(result.document.pageCount).toBe(3)
      expect(result.document.metadata.pageCount).toBe(3)
      expect(result.document.metadata.pagesWithText).toBe(3)
    }
  })

  it('honestly calls Claude sequentially, never in parallel', async () => {
    const files = makeFiles(3)
    const callOrder: number[] = []
    await extractImages(files, makeSource(), async (base64Data) => {
      callOrder.push(callOrder.length)
      await new Promise((resolve) => setTimeout(resolve, 5))
      return { text: `page ${base64Data.length}` }
    })
    expect(callOrder).toEqual([0, 1, 2])
  })

  it('skips a page with no readable text rather than failing the whole batch', async () => {
    const files = makeFiles(3)
    let callIndex = 0
    const result = await extractImages(files, makeSource(), async () => {
      callIndex += 1
      return callIndex === 2 ? { text: 'NO_TEXT_FOUND' } : { text: `Real content ${callIndex}.` }
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections).toHaveLength(2)
      expect(result.document.sections.map((section) => section.heading)).toEqual(['Page 1', 'Page 3'])
      expect(result.document.metadata.pagesWithText).toBe(2)
    }
  })

  it('skips a page whose transcription throws, rather than failing the whole batch', async () => {
    const files = makeFiles(2)
    let callIndex = 0
    const result = await extractImages(files, makeSource(), async () => {
      callIndex += 1
      if (callIndex === 1) throw new Error('transient failure')
      return { text: 'Second page content.' }
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections).toEqual([{ id: 'section-1', heading: 'Page 2', blocks: [{ type: 'paragraph', text: 'Second page content.' }] }])
    }
  })

  it('skips a page with an unsupported image format rather than failing the whole batch', async () => {
    const files = [new File([new Uint8Array([1])], 'page-1.webp', { type: 'image/webp' }), ...makeFiles(1)]
    const result = await extractImages(files, makeSource(), async () => ({ text: 'Real content.' }))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections).toHaveLength(1)
      expect(result.document.sections[0]?.heading).toBe('Page 2')
    }
  })

  it('fails honestly only when every single page has no real content', async () => {
    const files = makeFiles(2)
    const result = await extractImages(files, makeSource(), async () => ({ text: 'NO_TEXT_FOUND' }))
    expect(result).toEqual({
      success: false,
      error: { code: 'empty-extraction', message: 'No readable text was found in any of these pages.' },
    })
  })
})
