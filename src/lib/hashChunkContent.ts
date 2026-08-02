import { createHash } from 'node:crypto'

// Production AI Cost Optimization. Real per-chunk content identity — a
// SHA-256 of the chunk's own real text, nothing derived or approximate.
// Two chunks at the same document/order position hash equal only when
// their real content is byte-identical, which is exactly the signal
// `document_chunk_cache` needs to tell "this exact chunk was already
// enriched" apart from "this position's content genuinely changed since
// the last run."
export function hashChunkContent(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}
