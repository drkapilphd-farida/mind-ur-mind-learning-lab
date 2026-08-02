import { describe, expect, it } from 'vitest'
import { detectDocumentStructure } from './detectDocumentStructure'

describe('detectDocumentStructure', () => {
  it('detects a real image mime type as a single visual page', () => {
    expect(detectDocumentStructure('image/jpeg').structureLabel).toBe('A single visual page')
  })

  it('detects real PDF/Word mime types as structured, multi-section documents', () => {
    expect(detectDocumentStructure('application/pdf').structureLabel).toBe('A structured, multi-section document')
    expect(detectDocumentStructure('application/msword').structureLabel).toBe('A structured, multi-section document')
    expect(detectDocumentStructure('application/vnd.openxmlformats-officedocument.wordprocessingml.document').structureLabel).toBe('A structured, multi-section document')
  })

  it('falls back to a continuous block of text for plain text or a null mime type', () => {
    expect(detectDocumentStructure('text/plain').structureLabel).toBe('A continuous block of text')
    expect(detectDocumentStructure(null).structureLabel).toBe('A continuous block of text')
  })
})
