import { describe, expect, it } from 'vitest'
import type { UniversalSource } from '@/core/universal-learning-engine/upload'
import type { LearningSection } from '../types/UniversalLearningDocument'
import { buildUniversalLearningDocument } from './buildUniversalLearningDocument'

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

const SECTIONS: readonly LearningSection[] = [{ id: 'section-0', heading: null, blocks: [{ type: 'paragraph', text: 'Hello world.' }] }]

describe('buildUniversalLearningDocument', () => {
  it('assembles a UniversalLearningDocument with real readability metadata', () => {
    const document = buildUniversalLearningDocument(makeSource(), 'notes', SECTIONS, ['Hello world.'], 'Hello world.', null, { idFactory: () => 'fixed-id' })
    expect(document.id).toBe('fixed-id')
    expect(document.title).toBe('notes')
    expect(document.language).toBeNull()
    expect(document.wordCount).toBe(2)
    expect(document.metadata.characterCount).toBe(12)
    expect(document.metadata.paragraphCount).toBe(1)
    expect(document.pageCount).toBeNull()
    expect(document.source).toEqual(makeSource())
    expect(document.sections).toEqual(SECTIONS)
  })

  it('carries a real page count through for formats that have one', () => {
    const document = buildUniversalLearningDocument(makeSource(), 'notes', SECTIONS, ['Hello world.'], 'Hello world.', 5)
    expect(document.pageCount).toBe(5)
  })

  it('merges extraMetadata alongside the computed readability fields', () => {
    const document = buildUniversalLearningDocument(makeSource(), 'notes', SECTIONS, ['Hello world.'], 'Hello world.', null, { extraMetadata: { author: 'Jane Doe' } })
    expect(document.metadata.author).toBe('Jane Doe')
    expect(document.metadata.characterCount).toBeDefined()
  })

  it('generates a real id when no idFactory is supplied', () => {
    const document = buildUniversalLearningDocument(makeSource(), 'notes', SECTIONS, ['Hello world.'], 'Hello world.', null)
    expect(document.id.length).toBeGreaterThan(0)
  })
})
