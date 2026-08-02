import type { Clock } from '../contracts'
import type { RequestContext, RequestMetadata } from '../types'
import type { RequestMetadataAssembler } from './RequestMetadataAssembler'

export class DefaultRequestMetadataAssembler implements RequestMetadataAssembler {
  constructor(private readonly clock: Clock) {}

  assemble(context: RequestContext): RequestMetadata {
    return { learnerId: context.learnerId, profileId: context.profileId, source: 'request-execution-pipeline', generatedAt: this.clock.now() }
  }
}

export function createRequestMetadataAssembler(clock: Clock): RequestMetadataAssembler {
  return new DefaultRequestMetadataAssembler(clock)
}
