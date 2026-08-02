import { describe, expect, it } from 'vitest'
import { buildUniversalSource } from './buildUniversalSource'

function makeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('buildUniversalSource', () => {
  it('builds a UniversalSource with the terminal ready status', () => {
    const source = buildUniversalSource(makeFile('notes.pdf', 'application/pdf'), 'pdf', {}, { idFactory: () => 'fixed-id', now: () => new Date('2026-01-01T00:00:00.000Z') })
    expect(source).toEqual({
      id: 'fixed-id',
      name: 'notes.pdf',
      mimeType: 'application/pdf',
      extension: 'pdf',
      size: 1024,
      language: null,
      sourceType: 'pdf',
      status: 'ready',
      uploadedAt: '2026-01-01T00:00:00.000Z',
      metadata: {},
    })
  })

  it('lowercases the extension and handles multi-dot filenames', () => {
    const source = buildUniversalSource(makeFile('My.Report.V2.DOCX', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), 'docx', {})
    expect(source.extension).toBe('docx')
  })

  it('returns a null extension when the filename has none', () => {
    const source = buildUniversalSource(makeFile('README', 'text/plain'), 'txt', {})
    expect(source.extension).toBeNull()
  })

  it('carries the supplied metadata through unchanged', () => {
    const metadata = { declaredMimeType: 'text/plain', sizeBytes: 1024 }
    const source = buildUniversalSource(makeFile('notes.txt', 'text/plain'), 'txt', metadata)
    expect(source.metadata).toEqual(metadata)
  })

  it('generates a real id and timestamp when no overrides are supplied', () => {
    const source = buildUniversalSource(makeFile('notes.txt', 'text/plain'), 'txt', {})
    expect(source.id.length).toBeGreaterThan(0)
    expect(() => new Date(source.uploadedAt).toISOString()).not.toThrow()
  })
})
