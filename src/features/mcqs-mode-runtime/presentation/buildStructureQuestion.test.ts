import { describe, expect, it } from 'vitest'
import type { ModeChunkView } from '@/features/learning-mode-runtime'
import { buildStructureQuestion } from './buildStructureQuestion'
import type { DocumentSectionHeading } from './listDocumentSectionHeadings'
import type { DocumentDefinition } from './listDocumentDefinitions'

function makeChunkView(overrides: Partial<ModeChunkView> = {}): ModeChunkView {
  return { chunkNodeId: 'chunk-0', order: 0, content: 'Real content for this section.', title: null, sectionHeading: 'Heading 0', isCheckpoint: false, ...overrides }
}

const HEADINGS: readonly DocumentSectionHeading[] = [
  { chunkNodeId: 'chunk-0', order: 0, heading: 'Heading 0' },
  { chunkNodeId: 'chunk-1', order: 1, heading: 'Heading 1' },
  { chunkNodeId: 'chunk-2', order: 2, heading: 'Heading 2' },
  { chunkNodeId: 'chunk-3', order: 3, heading: 'Heading 3' },
]

describe('buildStructureQuestion', () => {
  it('returns null, honestly, when fewer than two real distinct headings exist', () => {
    const chunk = makeChunkView()
    expect(buildStructureQuestion(chunk, [{ chunkNodeId: 'chunk-0', order: 0, heading: 'Only Heading' }])).toBeNull()
  })

  it('builds a heading-to-next question for an even-order chunk with a real next section, exactly one correct option among real headings', () => {
    const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })

    const question = buildStructureQuestion(chunk, HEADINGS)

    expect(question?.kind).toBe('heading-to-next')
    if (question?.kind !== 'heading-to-next') throw new Error('expected heading-to-next')
    expect(question.heading).toBe('Heading 0')
    expect(question.options.filter((option) => option.isCorrect)).toHaveLength(1)
    expect(question.options.find((option) => option.isCorrect)?.heading).toBe('Heading 1')
    expect(question.options.every((option) => HEADINGS.some((real) => real.heading === option.heading))).toBe(true)
  })

  it('falls back to excerpt-to-heading for the last chunk (no real next section exists)', () => {
    const chunk = makeChunkView({ chunkNodeId: 'chunk-3', order: 3, sectionHeading: 'Heading 3' })

    const question = buildStructureQuestion(chunk, HEADINGS)

    expect(question?.kind).toBe('excerpt-to-heading')
    if (question?.kind !== 'excerpt-to-heading') throw new Error('expected excerpt-to-heading')
    expect(question.options.find((option) => option.isCorrect)?.heading).toBe('Heading 3')
  })

  it('builds an excerpt-to-heading question for an odd-order chunk, using a real excerpt of the real content', () => {
    const chunk = makeChunkView({ chunkNodeId: 'chunk-1', order: 1, sectionHeading: 'Heading 1', content: 'Real, specific content for section one.' })

    const question = buildStructureQuestion(chunk, HEADINGS)

    expect(question?.kind).toBe('excerpt-to-heading')
    if (question?.kind !== 'excerpt-to-heading') throw new Error('expected excerpt-to-heading')
    expect(question.excerpt).toBe('Real, specific content for section one.')
    expect(question.isExcerpt).toBe(false)
    expect(question.options.find((option) => option.isCorrect)?.heading).toBe('Heading 1')
  })

  it('is fully deterministic — the same chunk and headings always produce the exact same question and option order', () => {
    const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })

    const first = buildStructureQuestion(chunk, HEADINGS)
    const second = buildStructureQuestion(chunk, HEADINGS)

    expect(first).toEqual(second)
  })

  it('never includes more than 4 real options, and never includes the current chunk itself as a distractor', () => {
    const manyHeadings: DocumentSectionHeading[] = Array.from({ length: 10 }, (_unused, index) => ({ chunkNodeId: `chunk-${index}`, order: index, heading: `Heading ${index}` }))
    const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })

    const question = buildStructureQuestion(chunk, manyHeadings)

    expect(question?.options.length).toBeLessThanOrEqual(4)
    expect(question?.options.some((option) => option.chunkNodeId === 'chunk-0' && !option.isCorrect)).toBe(false)
  })

  describe('definition-to-term (Production AI Integration — ALS-24)', () => {
    const DEFINITIONS: readonly DocumentDefinition[] = [
      { chunkNodeId: 'chunk-0', term: 'Photosynthesis', definition: 'The process plants use to convert light into chemical energy.' },
      { chunkNodeId: 'chunk-1', term: 'Chlorophyll', definition: 'The pigment that absorbs light for photosynthesis.' },
      { chunkNodeId: 'chunk-2', term: 'Osmosis', definition: 'The movement of water across a membrane.' },
    ]

    it('takes priority over the structural kinds when this chunk has a real definition and real distractor terms exist elsewhere', () => {
      const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })

      const question = buildStructureQuestion(chunk, HEADINGS, DEFINITIONS)

      expect(question?.kind).toBe('definition-to-term')
      if (question?.kind !== 'definition-to-term') throw new Error('expected definition-to-term')
      expect(question.definition).toBe('The process plants use to convert light into chemical energy.')
      expect(question.options.filter((option) => option.isCorrect)).toHaveLength(1)
      expect(question.options.find((option) => option.isCorrect)?.heading).toBe('Photosynthesis')
      expect(question.options.every((option) => DEFINITIONS.some((real) => real.term === option.heading))).toBe(true)
    })

    it('never pulls a distractor term from the current chunk itself, even if it has multiple definitions', () => {
      const multiDefChunk: readonly DocumentDefinition[] = [
        { chunkNodeId: 'chunk-0', term: 'Photosynthesis', definition: 'Definition A.' },
        { chunkNodeId: 'chunk-0', term: 'Stomata', definition: 'Definition B.' },
        { chunkNodeId: 'chunk-1', term: 'Chlorophyll', definition: 'Definition C.' },
      ]
      const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })

      const question = buildStructureQuestion(chunk, HEADINGS, multiDefChunk)
      if (question?.kind !== 'definition-to-term') throw new Error('expected definition-to-term')

      expect(question.options.some((option) => option.heading === 'Stomata')).toBe(false)
    })

    it('falls back to the exact existing structural logic when this chunk has no real definitions yet', () => {
      const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })
      const otherChunkDefinitionsOnly: readonly DocumentDefinition[] = [{ chunkNodeId: 'chunk-1', term: 'Chlorophyll', definition: 'The pigment that absorbs light.' }]

      const question = buildStructureQuestion(chunk, HEADINGS, otherChunkDefinitionsOnly)

      expect(question?.kind).toBe('heading-to-next')
    })

    it('falls back to structural logic when no real distractor term exists anywhere else in the document', () => {
      const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })
      const onlyOwnDefinition: readonly DocumentDefinition[] = [{ chunkNodeId: 'chunk-0', term: 'Photosynthesis', definition: 'A real definition.' }]

      const question = buildStructureQuestion(chunk, HEADINGS, onlyOwnDefinition)

      expect(question?.kind).toBe('heading-to-next')
    })

    it('is fully deterministic — the same chunk and definitions always produce the exact same question and option order', () => {
      const chunk = makeChunkView({ chunkNodeId: 'chunk-0', order: 0 })

      const first = buildStructureQuestion(chunk, HEADINGS, DEFINITIONS)
      const second = buildStructureQuestion(chunk, HEADINGS, DEFINITIONS)

      expect(first).toEqual(second)
    })
  })
})
