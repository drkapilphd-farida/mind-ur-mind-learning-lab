// Caller-supplied, deterministic — the same "the caller supplies the fact"
// discipline as every prior sprint's outcome/signal input. Never produced or
// measured by this feature; always a fact handed in by the caller.
export type StreamChunk = {
  readonly sequenceNumber: number
  readonly content: string
  readonly isFinal: boolean
}
