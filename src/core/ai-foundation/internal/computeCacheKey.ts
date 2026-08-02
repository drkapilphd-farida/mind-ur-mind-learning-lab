import { createHash } from 'node:crypto'
import type { AITask } from '../types/AITask'
import type { AIFoundationPayload } from '../types/AIFoundationRequest'

// AI Foundation Layer™ — AIF-1. Pure, deterministic — the same task over
// the same real content always produces the same key, so "never repeat
// an identical AI request" holds. Namespaced by `task` so the same
// content processed for two different tasks (e.g. `summarization` vs
// `keyword-extraction`) never collides in the cache. `node:crypto` is
// server-only, matching the rest of this module — never imported into a
// client component.
export function computeCacheKey(task: AITask, payload: AIFoundationPayload): string {
  const normalized = {
    task,
    messages: payload.messages.map((message) => ({ role: message.role, content: message.content })),
    modelId: payload.modelId ?? null,
    temperature: payload.temperature ?? null,
    maxOutputTokens: payload.maxOutputTokens ?? null,
  }

  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}
