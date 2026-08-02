import type { RequestBuilderInputs, RequestContext } from '../types'
import type { ExecutionContextResolver } from './ExecutionContextResolver'

export class DefaultExecutionContextResolver implements ExecutionContextResolver {
  resolve(inputs: Pick<RequestBuilderInputs, 'learnerId' | 'profileId' | 'providerId' | 'modelId'>): RequestContext {
    return { learnerId: inputs.learnerId, profileId: inputs.profileId, providerId: inputs.providerId, modelId: inputs.modelId }
  }
}

export function createExecutionContextResolver(): ExecutionContextResolver {
  return new DefaultExecutionContextResolver()
}
