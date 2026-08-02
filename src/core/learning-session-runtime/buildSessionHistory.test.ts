import { describe, expect, it } from 'vitest'
import { FIXED_NOW, makeRuntime } from './testFixtures'
import { buildSessionSnapshot } from './buildSessionSnapshot'
import { buildSessionHistory } from './buildSessionHistory'

describe('buildSessionHistory', () => {
  it('derives real entries and totals from real snapshots', async () => {
    const runtimeA = await makeRuntime()
    const runtimeB = await makeRuntime()
    const completedB = { ...runtimeB, session: { ...runtimeB.session, status: 'completed' as const } }

    const snapshots = [buildSessionSnapshot(runtimeA, { now: FIXED_NOW }), buildSessionSnapshot(completedB, { now: FIXED_NOW })]
    const history = buildSessionHistory(snapshots)

    expect(history.totalSessions).toBe(2)
    expect(history.completedSessions).toBe(1)
    expect(history.entries).toHaveLength(2)
    expect(history.entries[0]).toEqual({
      sessionId: runtimeA.session.id,
      uloId: runtimeA.session.uloId,
      sessionType: runtimeA.session.sessionType,
      status: runtimeA.session.status,
      completionPercentage: runtimeA.progress.completionPercentage,
      startedAt: runtimeA.session.startedAt,
      completedAt: runtimeA.session.completedAt,
    })
  })

  it('reports zero totals for an empty history', () => {
    expect(buildSessionHistory([])).toEqual({ entries: [], totalSessions: 0, completedSessions: 0 })
  })
})
