import type { ContextPackage, ContextSizeLimits } from '@/features/memory-context-assembly'
import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import type { ContextPayload } from '../domain'
import { transformContextPackage } from './transformContextPackage'
import type { ContextAdapter } from './ContextAdapter'

export type ContextAdapterDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ContextAdapterDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements ContextAdapter — "Payload Transformation Engine" (Section
// 3) is this class: a thin wrapper supplying `now`/`id` from the
// injected Clock/IdGenerator around the pure `transformContextPackage`.
export class DefaultContextAdapter implements ContextAdapter {
  constructor(private readonly dependencies: ContextAdapterDependencies) {}

  transform(contextPackage: ContextPackage, payloadLimits: ContextSizeLimits | null): ContextPayload {
    return transformContextPackage(
      contextPackage,
      this.dependencies.clock.now(),
      this.dependencies.idGenerator.generate(),
      payloadLimits,
    )
  }
}

export function createContextAdapter(overrides: Partial<ContextAdapterDependencies> = {}): ContextAdapter {
  return new DefaultContextAdapter({ ...createDefaultDependencies(), ...overrides })
}
