import { createStreamingLifecycleManager, type StreamingLifecycleManager } from '../lifecycleManager'
import type { StreamingRunInputs, StreamingRunResult } from '../types'
import type { StreamingRuntimeEngine } from './StreamingRuntimeEngine'

export type StreamingRuntimeEngineDependencies = {
  lifecycleManager: StreamingLifecycleManager
}

function createDefaultDependencies(): StreamingRuntimeEngineDependencies {
  return { lifecycleManager: createStreamingLifecycleManager() }
}

export class DefaultStreamingRuntimeEngine implements StreamingRuntimeEngine {
  constructor(private readonly dependencies: StreamingRuntimeEngineDependencies) {}

  run(inputs: StreamingRunInputs): StreamingRunResult {
    return this.dependencies.lifecycleManager.run(inputs)
  }
}

export function createStreamingRuntimeEngine(
  overrides: Partial<StreamingRuntimeEngineDependencies> = {},
): StreamingRuntimeEngine {
  return new DefaultStreamingRuntimeEngine({ ...createDefaultDependencies(), ...overrides })
}
