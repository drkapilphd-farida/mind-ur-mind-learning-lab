import { describe, expect, it } from 'vitest'
import { LARGE_DOCUMENT_WARNING_BYTES, MAX_DOCUMENT_SIZE_BYTES } from '@/constants/documents'
import { validateDocumentFile } from './validateDocumentFile'

function file(bytes: readonly number[], type: string, name = 'file'): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

const PDF_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37] // "%PDF-1.7"
const JPEG_BYTES = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]
const PNG_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const WEBP_BYTES = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]
const HEIC_BYTES = [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]
const ZIP_BYTES = [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]
const OLE_BYTES = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]

describe('validateDocumentFile', () => {
  it('accepts a genuine PDF', async () => {
    const result = await validateDocumentFile(file(PDF_BYTES, 'application/pdf'))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('accepts a genuine JPEG', async () => {
    const result = await validateDocumentFile(file(JPEG_BYTES, 'image/jpeg'))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('accepts a genuine PNG', async () => {
    const result = await validateDocumentFile(file(PNG_BYTES, 'image/png'))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('accepts a genuine WEBP', async () => {
    const result = await validateDocumentFile(file(WEBP_BYTES, 'image/webp'))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('accepts a genuine HEIC', async () => {
    const result = await validateDocumentFile(file(HEIC_BYTES, 'image/heic'))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('accepts a genuine DOCX (zip signature)', async () => {
    const result = await validateDocumentFile(file(ZIP_BYTES, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('accepts a genuine legacy DOC (OLE signature)', async () => {
    const result = await validateDocumentFile(file(OLE_BYTES, 'application/msword'))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('accepts genuine plain text', async () => {
    const result = await validateDocumentFile(new File(['Hello, this is real text content.'], 'notes.txt', { type: 'text/plain' }))
    expect(result).toEqual({ valid: true, warning: null })
  })

  it('rejects a file whose MIME type is not in the accepted list', async () => {
    const result = await validateDocumentFile(file(PDF_BYTES, 'application/zip'))
    expect(result).toEqual({ valid: false, reason: 'unsupported-type' })
  })

  it('rejects a file over the max size', async () => {
    const big = new File([new Uint8Array(MAX_DOCUMENT_SIZE_BYTES + 1)], 'huge.pdf', { type: 'application/pdf' })
    const result = await validateDocumentFile(big)
    expect(result).toEqual({ valid: false, reason: 'too-large' })
  })

  it('warns, but still accepts, a file over the large-file threshold', async () => {
    const bytes = new Uint8Array(LARGE_DOCUMENT_WARNING_BYTES + 1)
    bytes.set(PDF_BYTES)
    const result = await validateDocumentFile(new File([bytes], 'big.pdf', { type: 'application/pdf' }))
    expect(result).toEqual({ valid: true, warning: 'large-file' })
  })

  it('rejects a renamed file whose real bytes do not match its declared MIME type', async () => {
    // A plain text file's bytes, relabeled as application/pdf — exactly the
    // "renamed extension" attack this validator exists to catch.
    const result = await validateDocumentFile(new File(['not a pdf'], 'fake.pdf', { type: 'application/pdf' }))
    expect(result).toEqual({ valid: false, reason: 'corrupted' })
  })

  it('rejects a JPEG-labelled file with the wrong magic bytes', async () => {
    const result = await validateDocumentFile(file(PNG_BYTES, 'image/jpeg'))
    expect(result).toEqual({ valid: false, reason: 'corrupted' })
  })

  it('rejects a DOCX-labelled file that is not really a zip', async () => {
    const result = await validateDocumentFile(file(PDF_BYTES, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
    expect(result).toEqual({ valid: false, reason: 'corrupted' })
  })

  it('rejects a text/plain file that is actually binary data', async () => {
    const result = await validateDocumentFile(file([0x00, 0x01, 0x02, 0xff, 0xfe], 'text/plain', 'binary.txt'))
    expect(result).toEqual({ valid: false, reason: 'corrupted' })
  })
})
