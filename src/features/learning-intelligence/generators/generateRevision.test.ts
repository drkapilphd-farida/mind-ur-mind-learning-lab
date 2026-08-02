import { describe, expect, it } from 'vitest'
import { generateRevision } from './generateRevision'
import { makeConceptGraph, makeExtractedContent } from '../testFixtures'

describe('generateRevision', () => {
  it('produces exactly one revision block per concept', async () => {
    const conceptGraph = makeConceptGraph()
    const blocks = await generateRevision({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(blocks).toHaveLength(conceptGraph.concepts.length)
  })

  it('includes the concept’s real title and description in the summary', async () => {
    const conceptGraph = makeConceptGraph()
    const blocks = await generateRevision({ conceptGraph, extractedContent: makeExtractedContent() })
    expect(blocks[0]?.summary).toContain('Introduction')
    expect(blocks[0]?.summary).toContain('An opening overview of the material.')
  })
})
