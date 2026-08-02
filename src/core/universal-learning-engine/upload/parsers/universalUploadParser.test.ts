import { describe, expect, it } from 'vitest'
import type { TextExtractionResult } from '@/lib/documentTextExtraction'
import type { DocumentValidationResult } from '@/lib/validateDocumentFile'
import { createUniversalUploadParser } from './universalUploadParser'

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type })
}

const ALWAYS_VALID = async (): Promise<DocumentValidationResult> => ({ valid: true, warning: null })
const ALWAYS_INVALID_TOO_LARGE = async (): Promise<DocumentValidationResult> => ({ valid: false, reason: 'too-large' })
const ALWAYS_READABLE = async (): Promise<TextExtractionResult> => ({ success: true, text: 'hello world' })
const ALWAYS_UNREADABLE = async (): Promise<TextExtractionResult> => ({
  success: false,
  error: "We couldn't read this document. It may be corrupted or password-protected.",
})

describe('createUniversalUploadParser', () => {
  it('detectType reports the right UniversalSourceType per format', () => {
    const parser = createUniversalUploadParser()
    expect(parser.detectType(makeFile('a.pdf', 'application/pdf'))).toBe('pdf')
    expect(parser.detectType(makeFile('a.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))).toBe('docx')
    expect(parser.detectType(makeFile('a.txt', 'text/plain'))).toBe('txt')
    expect(parser.detectType(makeFile('a.zip', 'application/zip'))).toBe('unknown')
  })

  it('parse() succeeds for a PDF with no extraction check involved', async () => {
    const parser = createUniversalUploadParser({ validateFn: ALWAYS_VALID })
    const result = await parser.parse(makeFile('notes.pdf', 'application/pdf'))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.source.sourceType).toBe('pdf')
      expect(result.source.status).toBe('ready')
      expect(result.source.name).toBe('notes.pdf')
    }
  })

  it('parse() fails fast on a validation error, never reaching extraction', async () => {
    const parser = createUniversalUploadParser({
      validateFn: ALWAYS_INVALID_TOO_LARGE,
      extractDocxFn: () => {
        throw new Error('extraction should not have been attempted')
      },
    })
    const result = await parser.parse(makeFile('huge.pdf', 'application/pdf'))
    expect(result).toEqual({ success: false, error: { code: 'file-too-large', message: 'This file is too large. Please choose a file up to 50 MB.' } })
  })

  it('parse() succeeds for a DOCX once both validation and extraction pass', async () => {
    const parser = createUniversalUploadParser({ validateFn: ALWAYS_VALID, extractDocxFn: ALWAYS_READABLE })
    const result = await parser.parse(makeFile('report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
    expect(result.success).toBe(true)
    if (result.success) expect(result.source.sourceType).toBe('docx')
  })

  it('parse() maps a DOCX extraction failure to unreadable-file, carrying the real error text', async () => {
    const parser = createUniversalUploadParser({ validateFn: ALWAYS_VALID, extractDocxFn: ALWAYS_UNREADABLE })
    const result = await parser.parse(makeFile('report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
    expect(result).toEqual({
      success: false,
      error: { code: 'unreadable-file', message: "We couldn't read this document. It may be corrupted or password-protected." },
    })
  })

  it('parse() maps a TXT extraction failure to unreadable-file', async () => {
    const parser = createUniversalUploadParser({ validateFn: ALWAYS_VALID, extractTxtFn: async () => ({ success: false, error: 'This text file appears to be empty.' }) })
    const result = await parser.parse(makeFile('notes.txt', 'text/plain'))
    expect(result).toEqual({ success: false, error: { code: 'unreadable-file', message: 'This text file appears to be empty.' } })
  })

  it('parse() never attempts an extraction check for PDF/image/legacy-doc', async () => {
    const parser = createUniversalUploadParser({
      validateFn: ALWAYS_VALID,
      extractDocxFn: () => {
        throw new Error('should not be called for images')
      },
    })
    const result = await parser.parse(makeFile('photo.jpg', 'image/jpeg'))
    expect(result.success).toBe(true)
  })

  it('extractMetadata returns structural metadata only, never extracted text', async () => {
    const parser = createUniversalUploadParser()
    const metadata = await parser.extractMetadata(makeFile('notes.txt', 'text/plain', 2048))
    expect(metadata).toEqual({ extension: 'txt', declaredMimeType: 'text/plain', sizeBytes: 2048 })
  })

  it('prepare() builds a real UniversalSource from the given type and metadata', async () => {
    const parser = createUniversalUploadParser()
    const source = await parser.prepare(makeFile('notes.pdf', 'application/pdf'), 'pdf', { extension: 'pdf' })
    expect(source.sourceType).toBe('pdf')
    expect(source.status).toBe('ready')
    expect(source.metadata).toEqual({ extension: 'pdf' })
  })
})
