import { describe, expect, it } from 'vitest'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { extractDOCX, parseDocxHtmlBlocks } from './extractDOCX'

function makeSource(): UniversalSource {
  return {
    id: 'source-1',
    name: 'report.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx',
    size: 100,
    language: null,
    sourceType: 'docx',
    status: 'ready',
    uploadedAt: '2026-01-01T00:00:00.000Z',
    metadata: {},
  }
}

function makeFile(): File {
  return new File([new Uint8Array([1, 2, 3])], 'report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

describe('parseDocxHtmlBlocks', () => {
  it('extracts headings and paragraphs in reading order', () => {
    const blocks = parseDocxHtmlBlocks('<h1>Title</h1><p>First paragraph.</p><h2>Section Two</h2><p>Second paragraph.</p>')
    expect(blocks).toEqual([
      { type: 'heading', level: 1, text: 'Title' },
      { type: 'paragraph', text: 'First paragraph.' },
      { type: 'heading', level: 2, text: 'Section Two' },
      { type: 'paragraph', text: 'Second paragraph.' },
    ])
  })

  it('extracts unordered and ordered lists', () => {
    const blocks = parseDocxHtmlBlocks('<ul><li>Apple</li><li>Banana</li></ul><ol><li>First</li><li>Second</li></ol>')
    expect(blocks).toEqual([
      { type: 'list', ordered: false, items: ['Apple', 'Banana'] },
      { type: 'list', ordered: true, items: ['First', 'Second'] },
    ])
  })

  it('extracts basic tables as rows of cell text', () => {
    const blocks = parseDocxHtmlBlocks('<table><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>')
    expect(blocks).toEqual([{ type: 'table', rows: [['A', 'B'], ['C', 'D']] }])
  })

  it('decodes HTML entities and strips nested inline tags', () => {
    const blocks = parseDocxHtmlBlocks('<p>Bold <strong>text</strong> &amp; more</p>')
    expect(blocks).toEqual([{ type: 'paragraph', text: 'Bold text & more' }])
  })

  it('returns no blocks for empty HTML', () => {
    expect(parseDocxHtmlBlocks('')).toEqual([])
  })

  it('detects a real embedded image marker with its real content-type and alt text', () => {
    const blocks = parseDocxHtmlBlocks('<p>Before.</p><img data-mammoth-image="true" data-content-type="image/png" alt="A diagram" /><p>After.</p>')
    expect(blocks).toEqual([
      { type: 'paragraph', text: 'Before.' },
      { type: 'image', contentType: 'image/png', alt: 'A diagram' },
      { type: 'paragraph', text: 'After.' },
    ])
  })

  it('records a null alt when the source document has no real alt text', () => {
    const blocks = parseDocxHtmlBlocks('<img data-mammoth-image="true" data-content-type="image/jpeg" />')
    expect(blocks).toEqual([{ type: 'image', contentType: 'image/jpeg', alt: null }])
  })

  it('ignores an <img> tag without the mammoth marker (never mistaken for a real detected image)', () => {
    expect(parseDocxHtmlBlocks('<img src="unrelated.png" />')).toEqual([])
  })
})

describe('extractDOCX', () => {
  it('extracts real headings/paragraphs/lists grouped into sections', async () => {
    const html = '<h1>Introduction</h1><p>Some intro text.</p><h2>Details</h2><p>More detail.</p><ul><li>Point one</li></ul>'
    const result = await extractDOCX(makeFile(), makeSource(), async () => html)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections).toHaveLength(2)
      expect(result.document.sections[0]?.heading).toBe('Introduction')
      expect(result.document.sections[1]?.heading).toBe('Details')
      expect(result.document.pageCount).toBeNull()
    }
  })

  it('groups content before the first heading into a heading-less section', async () => {
    const html = '<p>Preface text.</p><h1>Chapter One</h1><p>Chapter content.</p>'
    const result = await extractDOCX(makeFile(), makeSource(), async () => html)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections[0]?.heading).toBeNull()
      expect(result.document.sections[1]?.heading).toBe('Chapter One')
    }
  })

  it('maps a conversion throw to corrupted-document', async () => {
    const result = await extractDOCX(makeFile(), makeSource(), async () => {
      throw new Error('boom')
    })
    expect(result).toEqual({ success: false, error: { code: 'corrupted-document', message: "We couldn't read this document. It may be corrupted or password-protected." } })
  })

  it('maps empty HTML to empty-extraction', async () => {
    const result = await extractDOCX(makeFile(), makeSource(), async () => '')
    expect(result).toEqual({ success: false, error: { code: 'empty-extraction', message: "We couldn't find any content in this document." } })
  })

  it('carries real detected image blocks through into the section they appear in', async () => {
    const html = '<h1>Figures</h1><p>See below.</p><img data-mammoth-image="true" data-content-type="image/png" alt="Chart" />'
    const result = await extractDOCX(makeFile(), makeSource(), async () => html)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections[0]?.blocks).toEqual([{ type: 'paragraph', text: 'See below.' }, { type: 'image', contentType: 'image/png', alt: 'Chart' }])
    }
  })
})
