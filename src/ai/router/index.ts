// Picks which provider (and eventually which model within it) should
// handle a given AIRequest. Today there's exactly one provider, so this
// is a placeholder rather than real routing logic — but it's the one
// seam every caller should go through, so adding a second provider later
// never means touching call sites.

import { NotImplementedError } from '@/lib/errors'
import { AI_PROVIDERS } from '../providers'
import type { AIProvider, AIRequest, AIResponse } from '../types'

export function selectProvider(request: AIRequest): AIProvider {
  const provider = AI_PROVIDERS[0]
  if (provider === undefined) {
    throw new NotImplementedError(`selectProvider — no provider registered for purpose "${request.purpose}"`)
  }
  return provider
}

export async function routeRequest(request: AIRequest): Promise<AIResponse> {
  const provider = selectProvider(request)
  return provider.generate(request)
}
