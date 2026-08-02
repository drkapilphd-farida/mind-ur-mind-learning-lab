// Deterministic capacity constraints, caller-supplied — no real byte-level
// measurement anywhere; `maxBufferedContentLength` is a plain string-length
// count on caller-supplied `content`, not a measured payload size.
export type StreamBufferPolicy = {
  readonly maxBufferedChunks: number
  readonly maxBufferedContentLength: number
}
