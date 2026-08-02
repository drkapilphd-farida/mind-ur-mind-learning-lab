import { describe, expect, it } from 'vitest'
import { makeRuntime, makeULO } from './testFixtures'
import { diagnoseRuntimeHealth } from './diagnoseRuntimeHealth'

describe('diagnoseRuntimeHealth', () => {
  it('reports healthy for a real, freshly started, consistent runtime', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)

    expect(diagnoseRuntimeHealth(runtime, ulo)).toEqual({ healthy: true })
  })

  it('detects a real ulo-mismatch', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const otherUlo = await makeULO()
    const mismatchedUlo = { ...otherUlo, id: 'a-different-ulo-id' }

    const result = diagnoseRuntimeHealth(runtime, mismatchedUlo)
    expect(result.healthy).toBe(false)
    expect(!result.healthy && result.issues.map((issue) => issue.code)).toContain('ulo-mismatch')
  })

  it('detects a real stale ulo version when the id matches but the revision does not', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const newerUlo = { ...ulo, version: { ...ulo.version, revision: ulo.version.revision + 1 } }

    const result = diagnoseRuntimeHealth(runtime, newerUlo)
    expect(result.healthy).toBe(false)
    expect(!result.healthy && result.issues.map((issue) => issue.code)).toEqual(['ulo-version-stale'])
  })

  it('detects a real corrupted position', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const corrupted = { ...runtime, position: { queueIndex: 0, chunkNodeId: 'not-the-real-chunk-here' } }

    const result = diagnoseRuntimeHealth(corrupted, ulo)
    expect(result.healthy).toBe(false)
    expect(!result.healthy && result.issues.map((issue) => issue.code)).toContain('position-corrupted')
  })

  it('detects an empty scheduled queue while still active', async () => {
    const ulo = await makeULO()
    const runtime = await makeRuntime(ulo)
    const inconsistent = { ...runtime, scheduledQueue: { items: [] } }

    const result = diagnoseRuntimeHealth(inconsistent, ulo)
    expect(result.healthy).toBe(false)
    expect(!result.healthy && result.issues.map((issue) => issue.code)).toContain('empty-queue-while-active')
  })
})
