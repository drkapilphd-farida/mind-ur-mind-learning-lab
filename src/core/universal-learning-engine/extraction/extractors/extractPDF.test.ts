import { describe, expect, it } from 'vitest'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import { extractPDF } from './extractPDF'

function makeSource(): UniversalSource {
  return {
    id: 'source-1',
    name: 'notes.pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
    size: 100,
    language: null,
    sourceType: 'pdf',
    status: 'ready',
    uploadedAt: '2026-01-01T00:00:00.000Z',
    metadata: {},
  }
}

function makeFile(): File {
  return new File([new Uint8Array([1, 2, 3])], 'notes.pdf', { type: 'application/pdf' })
}

describe('extractPDF', () => {
  it('extracts real per-page text into one section per page, preserving reading order', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => ({
      numPages: 2,
      pageTexts: ['First page content.', 'Second page content.'],
      pageHasImage: [false, false],
      metadata: { pdfTitle: 'My Report', pdfAuthor: 'Jane Doe' },
    }))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.pageCount).toBe(2)
      expect(result.document.sections).toHaveLength(2)
      expect(result.document.sections[0]).toEqual({ id: 'page-1', heading: 'Page 1', blocks: [{ type: 'paragraph', text: 'First page content.' }] })
      expect(result.document.title).toBe('My Report')
      expect(result.document.metadata.pdfAuthor).toBe('Jane Doe')
    }
  })

  it('falls back to the source name as title when no real PDF title metadata exists', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => ({ numPages: 1, pageTexts: ['Some text.'], pageHasImage: [false], metadata: { pdfTitle: null, pdfAuthor: null } }))
    expect(result.success).toBe(true)
    if (result.success) expect(result.document.title).toBe('notes.pdf')
  })

  it('skips pages with no extractable text and no image, but keeps pages that have content', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => ({
      numPages: 3,
      pageTexts: ['Real content.', '   ', 'More content.'],
      pageHasImage: [false, false, false],
      metadata: {},
    }))
    expect(result.success).toBe(true)
    if (result.success) expect(result.document.sections).toHaveLength(2)
  })

  it('maps a fully empty extraction (e.g. a scanned PDF with no text layer) to empty-extraction', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => ({ numPages: 1, pageTexts: ['   '], pageHasImage: [false], metadata: {} }))
    expect(result).toEqual({
      success: false,
      error: { code: 'empty-extraction', message: 'This PDF has no extractable text — it may be a scanned image with no text layer.' },
    })
  })

  it('a page with a detected image but no text still becomes a real section, not fabricated text', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => ({
      numPages: 2,
      pageTexts: ['Real text on page one.', '   '],
      pageHasImage: [false, true],
      metadata: {},
    }))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections).toHaveLength(2)
      expect(result.document.sections[1]).toEqual({ id: 'page-2', heading: 'Page 2', blocks: [{ type: 'image', contentType: 'application/pdf-image', alt: null }] })
    }
  })

  it('an image-only PDF with zero text anywhere is still empty-extraction — no OCR means no usable content', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => ({ numPages: 1, pageTexts: ['   '], pageHasImage: [true], metadata: {} }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.code).toBe('empty-extraction')
  })

  it('appends a real image block alongside real text on the same page', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => ({ numPages: 1, pageTexts: ['Some real text.'], pageHasImage: [true], metadata: {} }))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.sections[0]?.blocks).toEqual([{ type: 'paragraph', text: 'Some real text.' }, { type: 'image', contentType: 'application/pdf-image', alt: null }])
    }
  })

  it('production incident regression — extracts real text from a real PDF via the real, un-mocked pdfjs-dist path (no injected extractFn)', async () => {
    // A genuinely minimal, valid, hand-built PDF — every prior test in this
    // file injects a fake `extractFn`, which is exactly why a real
    // misconfiguration in `defaultExtractPdfPages`'s own pdfjs-dist setup
    // (a browser-worker URL that hung indefinitely in a real Next.js
    // server bundle — see extractPDF.ts's own header comment) went
    // undetected by this whole test suite. This test exercises the real,
    // un-mocked default path end to end, with a real, valid PDF file.
    const pdfBytes = new TextEncoder().encode(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 20 100 Td (Hello ALS-22) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF',
    )
    const file = new File([pdfBytes], 'real.pdf', { type: 'application/pdf' })

    const result = await extractPDF(file, makeSource())

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.document.pageCount).toBe(1)
      expect(result.document.content).toContain('Hello ALS-22')
    }
  }, 15000)

  it('maps an extraction throw to corrupted-document', async () => {
    const result = await extractPDF(makeFile(), makeSource(), async () => {
      throw new Error('boom')
    })
    expect(result).toEqual({
      success: false,
      error: { code: 'corrupted-document', message: "We couldn't read this PDF. It may be corrupted, encrypted, or password-protected." },
    })
  })
})
