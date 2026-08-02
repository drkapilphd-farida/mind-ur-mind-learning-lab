import { describe, expect, it } from 'vitest'
import { createContextAssemblyPipeline } from './DefaultContextAssemblyPipeline'
import {
  createMemoryRepository,
  createQueryableMemoryRepository,
  createTypeSpecification,
  createCombinedSpecification,
  type QueryableMemoryRepository,
} from '@/features/memory-persistence'
import { makeFixedClock, makeMemory, makeSequentialIdGenerator, makeSessionContext } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'
const MATCH_ALL = createCombinedSpecification([])

function buildRepository(): QueryableMemoryRepository {
  return createQueryableMemoryRepository(createMemoryRepository())
}

describe('DefaultContextAssemblyPipeline', () => {
  it('collects candidates via the given query/filter specification', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', type: 'milestone', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('package') })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: createTypeSpecification('exercise'),
      sessionContext: null,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    expect(result.diagnostics.inputMemoryCount).toBe(1)
    const allReferences = result.contextPackage.sections.flatMap((s) => s.references)
    expect(allReferences.map((r) => r.memoryId)).toEqual(['a'])
  })

  it('excludes memories that are not eligible for retention (soft-deleted)', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', lifecycle: 'active', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.update(makeMemory({ id: 'a', lifecycle: 'deleted', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: null,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    const allReferences = result.contextPackage.sections.flatMap((s) => s.references)
    expect(allReferences).toEqual([])
    expect(result.diagnostics.selectedMemoryCount).toBe(0)
  })

  it('includes non-pinned, active memories (retention eligibility does not wrongly exclude everything)', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', lifecycle: 'active', pinned: false, metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: null,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    const allReferences = result.contextPackage.sections.flatMap((s) => s.references)
    expect(allReferences.map((r) => r.memoryId)).toEqual(['a'])
  })

  it('pulls in a memory referenced by the session context even if it does not match the specification', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', type: 'exercise', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', type: 'milestone', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const sessionContext = makeSessionContext({
      entries: [{ id: 'entry-1', memoryReferenceId: 'b', summary: 'x', addedAt: NOW }],
    })

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: createTypeSpecification('exercise'),
      sessionContext,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    const allReferences = result.contextPackage.sections.flatMap((s) => s.references)
    expect(allReferences.map((r) => r.memoryId).sort()).toEqual(['a', 'b'])
  })

  it('gives session-relevant memories a session-relevant reason and does not double-count them if already a candidate', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const sessionContext = makeSessionContext({ entries: [{ id: 'entry-1', memoryReferenceId: 'a', summary: 'x', addedAt: NOW }] })

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    const allReferences = result.contextPackage.sections.flatMap((s) => s.references)
    expect(allReferences).toHaveLength(1)
    expect(allReferences[0]?.reason).toContain('session-relevant')
  })

  it('applies configured size limits to the assembled package', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: null,
      limits: { maxMemoryCount: 1, maxSections: null, maxPayloadSize: null },
    })

    const allReferences = result.contextPackage.sections.flatMap((s) => s.references)
    expect(allReferences).toHaveLength(1)
    expect(result.diagnostics.trimmedMemoryCount).toBe(1)
  })

  it('produces a valid, non-empty package and reports validationStatus valid for a normal run', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: null,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    expect(result.validationResult.valid).toBe(true)
    expect(result.diagnostics.validationStatus).toBe('valid')
  })

  it('reports validationStatus invalid for an empty package (no matching memories)', async () => {
    const repository = buildRepository()

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: null,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    expect(result.diagnostics.validationStatus).toBe('invalid')
  })

  it('ignores a session reference to a memory id that does not exist or is no longer retention-eligible', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.save(makeMemory({ id: 'b', lifecycle: 'active', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))
    await repository.update(makeMemory({ id: 'b', lifecycle: 'deleted', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const sessionContext = makeSessionContext({
      entries: [
        { id: 'entry-1', memoryReferenceId: 'does-not-exist', summary: 'x', addedAt: NOW },
        { id: 'entry-2', memoryReferenceId: 'b', summary: 'x', addedAt: NOW },
      ],
    })

    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    const allReferences = result.contextPackage.sections.flatMap((s) => s.references)
    expect(allReferences.map((r) => r.memoryId)).toEqual(['a'])
  })

  it('uses default clock/id-generator adapters when no overrides are given', async () => {
    const repository = buildRepository()
    await repository.save(makeMemory({ id: 'a', metadata: { learnerId: 'learner-1', source: 's', tags: [] } }))

    const pipeline = createContextAssemblyPipeline(repository)
    const result = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: null,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })

    expect(result.contextPackage.id).toBeTruthy()
    expect(result.contextPackage.metadata.generatedAt).toBeTruthy()
  })

  it('sets metadata.sessionId from the given session context, or null when none is given', async () => {
    const repository = buildRepository()
    const pipeline = createContextAssemblyPipeline(repository, { clock: makeFixedClock(NOW) })

    const withoutSession = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: null,
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })
    expect(withoutSession.contextPackage.metadata.sessionId).toBeNull()

    const withSession = await pipeline.assemble({
      userId: 'learner-1',
      specification: MATCH_ALL,
      sessionContext: makeSessionContext({ id: 'session-x' }),
      limits: { maxMemoryCount: null, maxSections: null, maxPayloadSize: null },
    })
    expect(withSession.contextPackage.metadata.sessionId).toBe('session-x')
  })
})
