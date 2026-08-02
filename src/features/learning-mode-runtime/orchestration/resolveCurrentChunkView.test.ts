import { describe, expect, it } from 'vitest'
import { continueRuntime, startRuntime } from '@/core/adaptive-learning-runtime'
import { FIXED_NOW, makeIdFactory, makeULO } from '../testFixtures'
import { resolveCurrentChunkView } from './resolveCurrentChunkView'


describe('resolveCurrentChunkView', () => {
  it('resolves the real current chunk content from the real ULO and scheduled queue', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const view = resolveCurrentChunkView(started.state, ulo)

    expect(view).not.toBeNull()
    expect(view?.chunkNodeId).toBe('chunk-1')
    expect(view?.order).toBe(0)
    expect(view?.content).toBe(ulo.knowledge.chunks[0]?.content)
  })

  it('resolves the real chunk title and section heading too (ALS-15 — Memory Method™ framings read these)', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const view = resolveCurrentChunkView(started.state, ulo)

    expect(view?.title).toBe(ulo.knowledge.chunks[0]?.metadata.title)
    expect(view?.sectionHeading).toBe(ulo.knowledge.chunks[0]?.location.sectionHeading)
  })

  it('returns null, honestly, once the session has completed (no current chunk)', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const completed = { ...started.state, position: { queueIndex: 3, chunkNodeId: null } }
    expect(resolveCurrentChunkView(completed, ulo)).toBeNull()
  })

  it('resolves the real next chunk after real forward navigation', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')
    const advanced = continueRuntime(started.state, ulo, { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!advanced.success) throw new Error('fixture failed')

    const view = resolveCurrentChunkView(advanced.state, ulo)

    expect(view?.chunkNodeId).toBe('chunk-2')
    expect(view?.content).toBe(ulo.knowledge.chunks[1]?.content)
  })

  it('resolves correctly for a non-reading session type too (mode-agnostic)', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'memory', 'review-first', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const view = resolveCurrentChunkView(started.state, ulo)

    expect(view).not.toBeNull()
    expect(view?.chunkNodeId).toBeDefined()
  })

  it('threads the real chunk enrichment through, ALS-24 — Research Mode™/MCQs™/Memory Mode™ read this', async () => {
    const ulo = await makeULO()
    const started = startRuntime(ulo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const view = resolveCurrentChunkView(started.state, ulo)

    expect(view?.enrichment?.concepts).toContain('algebra')
  })

  it('omits enrichment entirely for a chunk with no real enrichment yet, rather than an empty object', async () => {
    const ulo = await makeULO()
    const unenrichedUlo = { ...ulo, knowledge: { ...ulo.knowledge, chunks: ulo.knowledge.chunks.map((chunk) => ({ ...chunk, enrichment: {} })) } }
    const started = startRuntime(unenrichedUlo, 'learner-1', 'reading', 'sequential', { now: FIXED_NOW, idFactory: makeIdFactory() })
    if (!started.success) throw new Error('fixture failed')

    const view = resolveCurrentChunkView(started.state, unenrichedUlo)

    expect(view?.enrichment).toBeUndefined()
    expect(view && 'enrichment' in view).toBe(false)
  })
})
