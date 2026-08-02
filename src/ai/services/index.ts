// The AI subsystem's own internal composition layer — wires router +
// cache + events together into the one function the rest of the app
// (via api/ai/, see docs/adr/0002-domain-layered-architecture.md) is
// meant to call, rather than reaching into router/cache/events
// individually. No real logic yet — composition only, and even the
// composition below is illustrative of the intended shape, not wired
// end to end (recordAIEvent and routeRequest both still throw).

import { routeRequest } from '../router'
import { recordAIEvent } from '../events'
import type { AIRequest, AIResponse } from '../types'

export async function runAIRequest(request: AIRequest): Promise<AIResponse> {
  const response = await routeRequest(request)

  await recordAIEvent({
    userId: request.userId,
    learningSessionId: request.learningSessionId ?? null,
    eventType: request.purpose,
    provider: response.provider,
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costCents: null,
    metadata: {},
  })

  return response
}
