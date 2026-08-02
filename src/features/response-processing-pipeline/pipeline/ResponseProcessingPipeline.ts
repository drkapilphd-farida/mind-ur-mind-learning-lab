import type { RawResponsePayload, ResponseProcessingResult } from '../types'

// One of the brief's own 10 named responsibilities — the top-level
// entry point: "validating, normalizing and processing AI responses
// after request execution." Never throws — see
// `ResponseProcessingResult`'s own header comment.
export interface ResponseProcessingPipeline {
  process(raw: RawResponsePayload): ResponseProcessingResult
}
