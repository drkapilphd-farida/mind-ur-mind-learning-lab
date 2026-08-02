import type { ExecutionContextResolver } from '../context'
import type { IdGenerator } from '../contracts'
import type { RequestMetadataAssembler } from '../metadata'
import type { RequestBuilderInputs, RequestEnvelope } from '../types'
import type { ExecutionRequestBuilder } from './ExecutionRequestBuilder'

export class DefaultExecutionRequestBuilder implements ExecutionRequestBuilder {
  constructor(
    private readonly idGenerator: IdGenerator,
    private readonly contextResolver: ExecutionContextResolver,
    private readonly metadataAssembler: RequestMetadataAssembler,
  ) {}

  build(inputs: RequestBuilderInputs): RequestEnvelope {
    const context = this.contextResolver.resolve(inputs)
    const metadata = this.metadataAssembler.assemble(context)

    return {
      id: this.idGenerator.generate(),
      context,
      payload: { systemPrompt: inputs.systemPrompt, userPrompt: inputs.userPrompt },
      metadata,
      configuration: inputs.configuration,
      safetyConfiguration: inputs.safetyConfiguration,
    }
  }
}

export function createExecutionRequestBuilder(
  idGenerator: IdGenerator,
  contextResolver: ExecutionContextResolver,
  metadataAssembler: RequestMetadataAssembler,
): ExecutionRequestBuilder {
  return new DefaultExecutionRequestBuilder(idGenerator, contextResolver, metadataAssembler)
}
