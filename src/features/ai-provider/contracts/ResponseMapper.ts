import type { AIResponse, RawProviderResult, ResponseMapperContext } from '../types'

// The reverse of RequestMapper — turns whatever execute() returned
// back into the canonical AIResponse shape every caller expects,
// regardless of which concrete adapter produced it.
export interface ResponseMapper {
  mapResponse(raw: RawProviderResult, context: ResponseMapperContext): AIResponse
}
