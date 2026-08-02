import { describe, expect, it } from 'vitest'
import type { LearningSection } from '@/core/universal-learning-engine/extraction'
import { chunkSections } from './chunkSections'

function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(' ')
}

describe('chunkSections', () => {
  it('produces one chunk per section when the section is under the target size', () => {
    const sections: readonly LearningSection[] = [
      { id: 'section-0', heading: 'Intro', blocks: [{ type: 'paragraph', text: 'A short paragraph.' }] },
      { id: 'section-1', heading: 'Body', blocks: [{ type: 'paragraph', text: 'Another short paragraph.' }] },
    ]
    const chunks = chunkSections('doc-1', sections)
    expect(chunks).toHaveLength(2)
    expect(chunks[0]).toMatchObject({ id: 'chunk-0', order: 0, heading: 'Intro', sectionId: 'section-0' })
    expect(chunks[1]).toMatchObject({ id: 'chunk-1', order: 1, heading: 'Body', sectionId: 'section-1' })
  })

  it('always starts a new chunk at a section boundary, even if the combined content would fit under the target', () => {
    const sections: readonly LearningSection[] = [
      { id: 'section-0', heading: 'A', blocks: [{ type: 'paragraph', text: 'Five words right here now.' }] },
      { id: 'section-1', heading: 'B', blocks: [{ type: 'paragraph', text: 'Another five words right now.' }] },
    ]
    const chunks = chunkSections('doc-1', sections, 200)
    expect(chunks).toHaveLength(2)
  })

  it('splits an oversized section into multiple chunks at a safe paragraph boundary', () => {
    const section: LearningSection = {
      id: 'section-0',
      heading: 'Long Chapter',
      blocks: [{ type: 'paragraph', text: words(120) }, { type: 'paragraph', text: words(120) }, { type: 'paragraph', text: words(120) }],
    }
    const chunks = chunkSections('doc-1', [section], 200)
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every((chunk) => chunk.sectionId === 'section-0')).toBe(true)
    expect(chunks.every((chunk) => chunk.heading === 'Long Chapter')).toBe(true)
    // Every real block from the section appears in exactly one chunk, in order.
    const allBlocks = chunks.flatMap((chunk) => chunk.blocks)
    expect(allBlocks).toEqual(section.blocks)
  })

  it('never splits a table across chunks, even when it alone exceeds the target size', () => {
    const bigTable = { type: 'table' as const, rows: Array.from({ length: 50 }, () => ['cell one two three', 'cell four five six']) }
    const section: LearningSection = { id: 'section-0', heading: 'Data', blocks: [{ type: 'paragraph', text: words(50) }, bigTable] }
    const chunks = chunkSections('doc-1', [section], 200)
    const chunkWithTable = chunks.find((chunk) => chunk.hasTable)
    expect(chunkWithTable).toBeDefined()
    expect(chunkWithTable?.blocks.filter((block) => block.type === 'table')).toHaveLength(1)
  })

  it('never splits an image out of the chunk it belongs to', () => {
    const section: LearningSection = {
      id: 'section-0',
      heading: 'Figures',
      blocks: [{ type: 'paragraph', text: words(180) }, { type: 'image', contentType: 'image/png', alt: null }],
    }
    const chunks = chunkSections('doc-1', [section], 200)
    const chunkWithImage = chunks.find((chunk) => chunk.hasImage)
    expect(chunkWithImage).toBeDefined()
  })

  it('sets hasTable/hasImage flags accurately per chunk', () => {
    const section: LearningSection = {
      id: 'section-0',
      heading: null,
      blocks: [{ type: 'paragraph', text: 'Plain text only.' }],
    }
    const chunks = chunkSections('doc-1', [section])
    expect(chunks[0]?.hasTable).toBe(false)
    expect(chunks[0]?.hasImage).toBe(false)
  })

  it('produces zero chunks for a section with no blocks', () => {
    const chunks = chunkSections('doc-1', [{ id: 'section-0', heading: 'Empty', blocks: [] }])
    expect(chunks).toEqual([])
  })

  it('is fully deterministic — the same input always produces byte-identical output', () => {
    const sections: readonly LearningSection[] = [
      { id: 'section-0', heading: 'A', blocks: [{ type: 'paragraph', text: words(150) }, { type: 'paragraph', text: words(150) }] },
      { id: 'section-1', heading: 'B', blocks: [{ type: 'list', ordered: false, items: ['one', 'two', 'three'] }] },
    ]
    const first = chunkSections('doc-1', sections)
    const second = chunkSections('doc-1', sections)
    expect(second).toEqual(first)
  })

  it('assigns stable, sequential chunk ids across the whole document, not restarting per section', () => {
    const sections: readonly LearningSection[] = [
      { id: 'section-0', heading: 'A', blocks: [{ type: 'paragraph', text: words(150) }, { type: 'paragraph', text: words(150) }] },
      { id: 'section-1', heading: 'B', blocks: [{ type: 'paragraph', text: 'Short.' }] },
    ]
    const chunks = chunkSections('doc-1', sections, 200)
    expect(chunks.map((chunk) => chunk.id)).toEqual(chunks.map((_, index) => `chunk-${index}`))
  })
})
