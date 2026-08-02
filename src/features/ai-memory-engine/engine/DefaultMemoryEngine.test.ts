import { describe, expect, it } from 'vitest'
import { createMemoryEngine } from './DefaultMemoryEngine'
import { makeMemoryCandidate, makeMemoryStore } from '../testFixtures'
import type { MemoryContext } from '../types'

describe('DefaultMemoryEngine (end-to-end, real default dependencies)', () => {
  it('remember() adds a new record, never mutating the original store', () => {
    const engine = createMemoryEngine()
    const original = makeMemoryStore([])
    const updated = engine.remember(original, makeMemoryCandidate())

    expect(original.records).toHaveLength(0)
    expect(updated.records).toHaveLength(1)
  })

  it('supports multiple remember() calls accumulating memory', () => {
    const engine = createMemoryEngine()
    let store = makeMemoryStore([])
    store = engine.remember(store, makeMemoryCandidate({ category: 'exercise', summary: 'Did exercise A' }))
    store = engine.remember(store, makeMemoryCandidate({ category: 'milestone', summary: 'Reached 50%' }))

    expect(store.records).toHaveLength(2)
  })

  it('snapshot() excludes expired records and scopes to one learner', () => {
    const engine = createMemoryEngine()
    let store = makeMemoryStore([])
    store = engine.remember(store, makeMemoryCandidate({ learnerId: 'learner-1', category: 'exercise', occurredAt: '2020-01-01T00:00:00.000Z' }))
    store = engine.remember(store, makeMemoryCandidate({ learnerId: 'learner-1', category: 'milestone', occurredAt: '2026-01-01T00:00:00.000Z' }))
    store = engine.remember(store, makeMemoryCandidate({ learnerId: 'learner-2', category: 'milestone', occurredAt: '2026-01-01T00:00:00.000Z' }))

    const snapshot = engine.snapshot(store, 'learner-1', '2026-06-01T00:00:00.000Z')

    // exercise has weekly retention, so the 2020 record is long expired.
    expect(snapshot.records.map((record) => record.category)).toEqual(['milestone'])
  })

  it('buildContext() groups by category in a fixed, deterministic order', () => {
    const engine = createMemoryEngine()
    let store = makeMemoryStore([])
    store = engine.remember(store, makeMemoryCandidate({ category: 'milestone', summary: 'Reached 50%' }))
    store = engine.remember(store, makeMemoryCandidate({ category: 'assessment', summary: 'Scored well on reading assessment' }))

    const snapshot = engine.snapshot(store, 'learner-1', '2026-01-01T00:00:00.000Z')
    const context = engine.buildContext(snapshot)

    // 'assessment' precedes 'milestone' in ALL_CATEGORIES, regardless of
    // remember() call order above.
    expect(context.sections.map((section) => section.category)).toEqual(['assessment', 'milestone'])
  })

  it('buildContext() never includes an empty section for a category with no records', () => {
    const engine = createMemoryEngine()
    const store = engine.remember(makeMemoryStore([]), makeMemoryCandidate({ category: 'exercise' }))
    const snapshot = engine.snapshot(store, 'learner-1', '2026-01-01T00:00:00.000Z')
    const context = engine.buildContext(snapshot)

    expect(context.sections).toHaveLength(1)
    expect(context.sections[0]?.category).toBe('exercise')
  })

  it('buildContext() compresses each category to maxRecordsPerCategory', () => {
    const engine = createMemoryEngine()
    let store = makeMemoryStore([])
    for (let i = 0; i < 8; i += 1) {
      // 'milestone' has permanent retention — never expires, isolating
      // this test from retention/expiry behavior (covered separately).
      store = engine.remember(store, makeMemoryCandidate({ category: 'milestone', summary: `Milestone ${i}`, occurredAt: `2026-01-0${(i % 9) + 1}T00:00:00.000Z` }))
    }

    const snapshot = engine.snapshot(store, 'learner-1', '2026-06-01T00:00:00.000Z')
    const context = engine.buildContext(snapshot, 3)

    expect(context.sections[0]?.summaries).toHaveLength(3)
  })

  it('timeline() sorts every record oldest-first, across categories', () => {
    const engine = createMemoryEngine()
    let store = makeMemoryStore([])
    store = engine.remember(store, makeMemoryCandidate({ category: 'milestone', occurredAt: '2026-01-03T00:00:00.000Z', summary: 'third' }))
    store = engine.remember(store, makeMemoryCandidate({ category: 'exercise', occurredAt: '2026-01-01T00:00:00.000Z', summary: 'first' }))
    store = engine.remember(store, makeMemoryCandidate({ category: 'assessment', occurredAt: '2026-01-02T00:00:00.000Z', summary: 'second' }))

    const timeline = engine.timeline(store, 'learner-1')
    expect(timeline.entries.map((entry) => entry.summary)).toEqual(['first', 'second', 'third'])
  })

  it('is fully deterministic — the same operations always produce the same result', () => {
    const buildContext = (): MemoryContext => {
      const engine = createMemoryEngine()
      const store = engine.remember(makeMemoryStore([]), makeMemoryCandidate({ category: 'milestone' }))
      const snapshot = engine.snapshot(store, 'learner-1', '2026-01-01T00:00:00.000Z')
      return engine.buildContext(snapshot)
    }

    expect(buildContext()).toEqual(buildContext())
  })
})
