import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeRuntime } from './testFixtures'
import { buildSessionSnapshot } from './buildSessionSnapshot'
import { computeRuntimeMetrics } from './computeRuntimeMetrics'

describe('buildSessionSnapshot', () => {
  it('projects a real, bounded snapshot from the runtime, never including a raw eventLog', async () => {
    const runtime = await makeRuntime()
    const snapshot = buildSessionSnapshot(runtime, { now: FIXED_NOW })

    expect(snapshot).toEqual({
      runtimeId: runtime.id,
      sessionId: runtime.session.id,
      learnerId: runtime.session.learnerId,
      documentId: runtime.session.documentId,
      uloId: runtime.session.uloId,
      uloVersion: runtime.session.uloVersion,
      sessionType: runtime.session.sessionType,
      strategy: runtime.strategy,
      method: null,
      status: runtime.session.status,
      completedChunkIds: runtime.progress.completedChunkIds,
      skippedChunkIds: runtime.skippedChunkIds,
      revisitChunkIds: runtime.revisitChunkIds,
      repeatCounts: runtime.repeatCounts,
      completionPercentage: runtime.progress.completionPercentage,
      metrics: computeRuntimeMetrics(runtime),
      startedAt: runtime.session.startedAt,
      completedAt: runtime.session.completedAt,
      capturedAt: '2026-01-01T00:00:00.000Z',
    })
    expect('eventLog' in snapshot).toBe(false)
  })
})
