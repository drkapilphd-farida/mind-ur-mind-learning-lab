import type { Memory } from '../domain'
import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import type { CleanupCandidate, CleanupPlan, MemoryRetentionPolicy } from '../retentionDomain'
import { identifyCleanupCandidates } from './identifyCleanupCandidates'
import { identifyArchivalCandidates } from './identifyArchivalCandidates'
import { generateCleanupPlan } from './generateCleanupPlan'
import { validateExecutionOrder } from './validateExecutionOrder'
import type { CleanupPlanner } from './CleanupPlanner'

export type CleanupPlannerDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): CleanupPlannerDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements CleanupPlanner — a thin wrapper supplying `now`/`id` from
// the injected Clock/IdGenerator around this folder's pure functions.
export class DefaultCleanupPlanner implements CleanupPlanner {
  constructor(private readonly dependencies: CleanupPlannerDependencies) {}

  identifyCleanupCandidates(
    memories: readonly Memory[],
    policies: readonly MemoryRetentionPolicy[],
    now: string,
  ): readonly CleanupCandidate[] {
    return identifyCleanupCandidates(memories, policies, now)
  }

  identifyArchivalCandidates(
    memories: readonly Memory[],
    policies: readonly MemoryRetentionPolicy[],
    now: string,
  ): readonly CleanupCandidate[] {
    return identifyArchivalCandidates(memories, policies, now)
  }

  generatePlan(memories: readonly Memory[], policies: readonly MemoryRetentionPolicy[]): CleanupPlan {
    const now = this.dependencies.clock.now()
    return generateCleanupPlan(memories, policies, now, this.dependencies.idGenerator.generate())
  }

  validateExecutionOrder(plan: CleanupPlan): boolean {
    return validateExecutionOrder(plan)
  }
}

export function createCleanupPlanner(overrides: Partial<CleanupPlannerDependencies> = {}): CleanupPlanner {
  return new DefaultCleanupPlanner({ ...createDefaultDependencies(), ...overrides })
}
