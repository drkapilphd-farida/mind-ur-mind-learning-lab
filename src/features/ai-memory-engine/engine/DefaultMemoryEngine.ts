import type { MemoryCandidate, MemoryContext, MemoryContextSection, MemoryRecord, MemorySnapshot, MemoryStore, MemoryTimeline } from '../types'
import type { MemoryBuilder, MemoryCompressor, MemoryEngine, MemoryStoreOperations } from '../contracts'
import { createMemoryBuilder } from '../building'
import { createMemoryStoreOperations } from '../storeOperations'
import { createMemoryCompressor } from '../compression'
import { ALL_CATEGORIES } from './ALL_CATEGORIES'

const DEFAULT_MAX_RECORDS_PER_CATEGORY = 5

export type MemoryEngineDependencies = {
  builder: MemoryBuilder
  storeOperations: MemoryStoreOperations
  compressor: MemoryCompressor
}

function createDefaultDependencies(): MemoryEngineDependencies {
  return {
    builder: createMemoryBuilder(),
    storeOperations: createMemoryStoreOperations(),
    compressor: createMemoryCompressor(),
  }
}

// Implements MemoryEngine — composes every other piece in this feature
// into the 4 operations a caller actually needs.
export class DefaultMemoryEngine implements MemoryEngine {
  constructor(private readonly dependencies: MemoryEngineDependencies) {}

  // "Collect memory candidates" + categorize/prioritize/retain + store,
  // in one pure call — returns a *new* MemoryStore.
  remember(store: MemoryStore, candidate: MemoryCandidate): MemoryStore {
    const record = this.dependencies.builder.build(candidate)
    return this.dependencies.storeOperations.add(store, record)
  }

  // "Build memory snapshots" — a non-expired, point-in-time view for
  // one learner.
  snapshot(store: MemoryStore, learnerId: string, now: string): MemorySnapshot {
    const activeStore = this.dependencies.storeOperations.removeExpired(store, now)
    return { learnerId, records: this.dependencies.storeOperations.getByLearner(activeStore, learnerId), generatedAt: now }
  }

  // "Merge memory context. Prepare future AI context." — groups by
  // category (in a fixed, deterministic category order — never
  // dependent on record insertion order), compresses each group to
  // `maxRecordsPerCategory` via MemoryCompressor.
  buildContext(snapshot: MemorySnapshot, maxRecordsPerCategory: number = DEFAULT_MAX_RECORDS_PER_CATEGORY): MemoryContext {
    const recordsByCategory = new Map<string, MemoryRecord[]>()
    for (const record of snapshot.records) {
      const existing = recordsByCategory.get(record.category)
      if (existing) existing.push(record)
      else recordsByCategory.set(record.category, [record])
    }

    const sections: MemoryContextSection[] = []
    for (const category of ALL_CATEGORIES) {
      const records = recordsByCategory.get(category)
      if (!records || records.length === 0) continue
      const compressed = this.dependencies.compressor.compress(records, maxRecordsPerCategory)
      sections.push({ category, summaries: compressed.map((record) => record.summary) })
    }

    return { learnerId: snapshot.learnerId, sections, generatedAt: snapshot.generatedAt }
  }

  // MemoryTimeline™ — every record for this learner, oldest first,
  // across every category.
  timeline(store: MemoryStore, learnerId: string): MemoryTimeline {
    const records = this.dependencies.storeOperations.getByLearner(store, learnerId)
    const entries = [...records]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((record) => ({ recordId: record.id, category: record.category, summary: record.summary, occurredAt: record.createdAt }))

    return { learnerId, entries }
  }
}

export function createMemoryEngine(overrides: Partial<MemoryEngineDependencies> = {}): MemoryEngine {
  return new DefaultMemoryEngine({ ...createDefaultDependencies(), ...overrides })
}
