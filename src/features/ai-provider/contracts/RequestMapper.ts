import type { AIModel, AIRequest, MappedProviderRequest } from '../types'

// Translates a generic AIRequest into whatever BaseProviderAdapter's
// execute() step needs — the mock's is a flat prompt string; a real
// OpenAI/Claude/Gemini RequestMapper would instead build that
// provider's own message/tool-call payload shape. This is the one
// documented seam a real provider integration replaces.
export interface RequestMapper {
  mapRequest(request: AIRequest, model: AIModel): MappedProviderRequest
}
