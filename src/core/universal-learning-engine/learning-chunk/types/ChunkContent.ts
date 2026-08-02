// Learning Chunk™ (canonical domain model). Real, mapped 1:1 from the
// chunk's own real UCE-2 'image' blocks — presence + content-type only,
// never OCR/pixel content, matching UCE-2's own established boundary.
export type ChunkMedia = {
  id: string
  contentType: string
  alt: string | null
}

// Real, mapped 1:1 from the chunk's own real UCE-2 'table' blocks.
export type ChunkTable = {
  id: string
  rows: readonly (readonly string[])[]
}

// Reserved — always [] this sprint. UCE-2 doesn't preserve LaTeX
// delimiters or math-notation markers, so there is no real signal to
// detect a formula from today. A disclosed structural gap (a future
// UCE-2 extension, pattern-based, not AI) — never fabricated here.
export type ChunkFormula = {
  id: string
  notation: string
  format: 'latex' | 'mathml' | 'plain'
}

// Reserved — always [] this sprint. Same class of gap as ChunkFormula:
// UCE-2 doesn't preserve font/monospace signals that would distinguish a
// real code snippet from a plain paragraph.
export type ChunkCode = {
  id: string
  code: string
  language: string | null
}

// Reserved — always [] this sprint. No citation/reference detection
// exists anywhere in UCE-2 yet.
export type ChunkCitation = {
  id: string
  text: string
  citationType: 'footnote' | 'reference' | 'source' | 'unknown'
}
