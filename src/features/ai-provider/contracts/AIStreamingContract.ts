import type { AIRequest } from '../types'

export type AIStreamChunk = {
  content: string
  isFinal: boolean
}

// Interface only — "NO streaming implementation" this sprint. No
// class anywhere in this feature implements AIStreamingContract; it
// exists purely so the *shape* of a future streaming response is
// already agreed on (an async-iterable of chunks, each flagged when
// it's the last one) before any provider actually needs to produce
// one.
export interface AIStreamingContract {
  stream(request: AIRequest): AsyncIterable<AIStreamChunk>
}
