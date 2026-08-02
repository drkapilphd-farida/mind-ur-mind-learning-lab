import type { MemoryCandidate, MemoryRecord } from '../types'
import type { IdGenerator, MemoryBuilder } from '../contracts'
import { CATEGORY_DEFAULTS } from '../categoryDefaults'
import { computeExpiresAt } from '../retention'
import { randomIdGenerator } from '../adapters'

export type MemoryBuilderDependencies = {
  idGenerator: IdGenerator
}

function createDefaultDependencies(): MemoryBuilderDependencies {
  return { idGenerator: randomIdGenerator }
}

// Implements MemoryBuilder. `createdAt`/`expiresAt` are both derived
// from `candidate.occurredAt` (when the real event happened), never
// from "now" (when it happened to be processed) — a memory recorded a
// week late about an old event shouldn't look artificially fresh.
export class DefaultMemoryBuilder implements MemoryBuilder {
  constructor(private readonly dependencies: MemoryBuilderDependencies) {}

  build(candidate: MemoryCandidate): MemoryRecord {
    const { priority, retention } = CATEGORY_DEFAULTS[candidate.category]

    return {
      id: this.dependencies.idGenerator.generate(),
      learnerId: candidate.learnerId,
      category: candidate.category,
      priority,
      retention,
      summary: candidate.summary,
      data: candidate.data,
      createdAt: candidate.occurredAt,
      expiresAt: computeExpiresAt(candidate.occurredAt, retention),
      vectorEmbeddingId: null,
    }
  }
}

export function createMemoryBuilder(overrides: Partial<MemoryBuilderDependencies> = {}): MemoryBuilder {
  return new DefaultMemoryBuilder({ ...createDefaultDependencies(), ...overrides })
}
