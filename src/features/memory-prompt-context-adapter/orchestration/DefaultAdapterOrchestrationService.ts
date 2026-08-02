import type { ContextPackage, ContextSizeLimits } from '@/features/memory-context-assembly'
import type { Clock } from '../contracts'
import { systemClock } from '../adapters'
import type { ContextAdapter } from '../transformation'
import { createContextAdapter } from '../transformation'
import { validateContextPayload } from '../validation'
import { computeAdapterDiagnostics } from '../diagnostics'
import type { AdapterOrchestrationResult } from './AdapterOrchestrationResult'
import type { AdapterOrchestrationService } from './AdapterOrchestrationService'

export type AdapterOrchestrationServiceDependencies = {
  adapter: ContextAdapter
  clock: Clock
}

function createDefaultDependencies(): AdapterOrchestrationServiceDependencies {
  const clock = systemClock
  return { adapter: createContextAdapter({ clock }), clock }
}

// Implements AdapterOrchestrationService — composes the transformation
// engine, payload validation, and diagnostics into one call. The
// `startedAt`/`finishedAt` timestamps bracketing `adapter.transform()`
// are what "Transformation duration (deterministic measurement)"
// means here: both come from the same injected Clock, so the exact
// same formula, given the same clock outputs, always produces the
// same duration.
export class DefaultAdapterOrchestrationService implements AdapterOrchestrationService {
  constructor(private readonly dependencies: AdapterOrchestrationServiceDependencies) {}

  execute(contextPackage: ContextPackage, payloadLimits: ContextSizeLimits | null): AdapterOrchestrationResult {
    const startedAt = this.dependencies.clock.now()
    const payload = this.dependencies.adapter.transform(contextPackage, payloadLimits)
    const finishedAt = this.dependencies.clock.now()

    const validationResult = validateContextPayload(payload)
    const diagnostics = computeAdapterDiagnostics(payload, contextPackage.metadata.version, validationResult, startedAt, finishedAt)

    return { payload, validationResult, diagnostics }
  }
}

export function createAdapterOrchestrationService(
  overrides: Partial<AdapterOrchestrationServiceDependencies> = {},
): AdapterOrchestrationService {
  return new DefaultAdapterOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}
