import type { ArchiveEligibilityValidator, QueryableMemoryRepository } from '@/features/memory-persistence'
import { createArchiveEligibilityValidator } from '@/features/memory-persistence'
import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import type { ContextPackage } from '../domain'
import { prioritizeMemory } from '../prioritization'
import { applyContextSizeLimits } from '../sizeManagement'
import { validateContextPackage } from '../validation'
import { computePipelineDiagnostics } from '../diagnostics'
import { buildContextSections } from './buildContextSections'
import type { ContextAssemblyInput } from './ContextAssemblyInput'
import type { ContextAssemblyResult } from './ContextAssemblyResult'
import type { ContextAssemblyPipeline } from './ContextAssemblyPipeline'

export type ContextAssemblyPipelineDependencies = {
  repository: QueryableMemoryRepository
  eligibilityValidator: ArchiveEligibilityValidator
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(repository: QueryableMemoryRepository): ContextAssemblyPipelineDependencies {
  return {
    repository,
    eligibilityValidator: createArchiveEligibilityValidator(),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  }
}

// Implements ContextAssemblyPipeline. Every step below is either a
// direct call into `@/features/memory-persistence`'s own existing
// infrastructure (query, retention eligibility) or a pure function
// from this feature's own `prioritization`/`sizeManagement`/
// `validation`/`diagnostics` folders — no repository-specific business
// logic lives in this class beyond that composition ("No business
// logic inside repositories").
export class DefaultContextAssemblyPipeline implements ContextAssemblyPipeline {
  constructor(private readonly dependencies: ContextAssemblyPipelineDependencies) {}

  async assemble(input: ContextAssemblyInput): Promise<ContextAssemblyResult> {
    const now = this.dependencies.clock.now()

    // Step 1+2: collect candidates via Sprint 14's existing
    // query/filter infrastructure — this pipeline never re-implements
    // filtering itself.
    const queried = await this.dependencies.repository.query(input.specification, input.userId)
    const inputMemoryCount = queried.length

    // Step 3: retention eligibility (Sprint 19). Deliberately
    // `isEligibleForRetentionExtension` here, not `isEligibleForDeletion`
    // — the latter answers "is deletion *permitted*" (true for almost
    // every non-pinned memory, since it's a permission check, not a
    // policy-match signal) and would wrongly exclude nearly everything.
    // `isEligibleForRetentionExtension` correctly answers "is this
    // memory still eligible to be retained at all" (i.e. not already
    // soft-deleted via a lifecycle transition that bypassed
    // `repository.delete()` — see that method's own doc comment).
    const eligible = queried.filter((memory) => this.dependencies.eligibilityValidator.isEligibleForRetentionExtension(memory))

    // Step 4: session context rules (Sprint 15) — guarantee every
    // memory the active session is already relying on is present,
    // even if it wouldn't otherwise match `input.specification`.
    const sessionMemoryIds = new Set(input.sessionContext?.entries.map((entry) => entry.memoryReferenceId) ?? [])
    const candidateById = new Map(eligible.map((memory) => [memory.id, memory] as const))

    for (const memoryId of sessionMemoryIds) {
      if (candidateById.has(memoryId)) continue
      const loaded = await this.dependencies.repository.load(memoryId)
      if (loaded && this.dependencies.eligibilityValidator.isEligibleForRetentionExtension(loaded)) {
        candidateById.set(memoryId, loaded)
      }
    }

    const candidates = [...candidateById.values()]
    const selectedMemoryCount = candidates.length

    // Step 5: deterministic prioritization — pinned, importance,
    // recency, session relevance, lifecycle. No semantic scoring.
    const prioritized = candidates.map((memory) => prioritizeMemory(memory, sessionMemoryIds.has(memory.id), now))

    // Step 6: group into priority-ordered sections.
    const sections = buildContextSections(prioritized)

    // Step 7: apply configured size limits, trimming from the back.
    const trimmedSections = applyContextSizeLimits(sections, input.limits)

    // Step 8: package.
    const contextPackage: ContextPackage = {
      id: this.dependencies.idGenerator.generate(),
      sections: trimmedSections,
      metadata: { sessionId: input.sessionContext?.id ?? null, generatedAt: now, version: 1 },
    }

    // Step 9: validate the finished package.
    const validationResult = validateContextPackage(contextPackage, candidates, input.limits)

    // Step 10: diagnostics.
    const diagnostics = computePipelineDiagnostics(inputMemoryCount, selectedMemoryCount, contextPackage, validationResult)

    return { contextPackage, validationResult, diagnostics }
  }
}

// `repository` has no sensible standalone default — a pipeline
// disconnected from the caller's actual memory repository would be
// useless — so it's a required parameter, the same convention as
// `@/features/memory-persistence`'s own `createTransactionCoordinator`.
export function createContextAssemblyPipeline(
  repository: QueryableMemoryRepository,
  overrides: Partial<ContextAssemblyPipelineDependencies> = {},
): ContextAssemblyPipeline {
  return new DefaultContextAssemblyPipeline({ ...createDefaultDependencies(repository), ...overrides })
}
