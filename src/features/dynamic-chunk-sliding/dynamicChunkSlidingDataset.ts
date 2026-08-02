import type { ReadingUnit } from '@/features/reading-engine/types'

// Dynamic Chunk Sliding™ — Quantum Speed Reading™ V2, third advanced
// training exercise. Deliberately its own folder/content, separate from
// both the unrelated, protected V1 "Chunk Reading™" exercises
// (src/features/chunk-reading/, src/features/progressive-chunk-reading/)
// and from Phrase Reading Mode™ (src/features/phrase-reading-mode/) — no
// shared files, no route collision. Real, hand-authored full sentences
// (no AI, no API, no lorem ipsum), each split into 3-4 word chunk groups
// by `splitIntoChunks` below — the genuine differentiator from Phrase
// Reading Mode, whose phrases are hand-pre-chunked at authoring time.
// Here the sentences stay whole, natural prose, and the chunk boundaries
// are derived programmatically, which is the "dataset splitting logic"
// this exercise specifically calls for.
const DYNAMIC_CHUNK_SLIDING_SENTENCES: readonly string[] = [
  'Steady practice turns small daily efforts into lasting skill and quiet confidence over time.',
  'A focused mind moves through information without getting lost in unnecessary detail or noise.',
  'Every skilled reader once struggled through slow, effortful sentences before finding their natural rhythm.',
  'Clarity comes from repetition, not from forcing yourself to understand everything all at once.',
  'The eyes can be trained to take in more meaning with far less conscious effort.',
  'Patience during practice matters more than raw speed during the very first few attempts.',
  'Real progress often feels invisible day to day until you look back and notice it.',
  'Curiosity keeps the mind open, while discipline keeps the practice consistent and honest.',
  'A calm breath before you begin lets the next few minutes of focus arrive easily.',
  'Small, repeated wins quietly rebuild the confidence that slow reading once wore away.',
]

// Splits a sentence into meaningful 3-4 word chunk groups. Greedy from the
// left at `maxSize`, but shrinks the current chunk whenever taking the max
// would leave a trailing remainder smaller than `minSize` (a lone 1-2 word
// orphan). Some totals (e.g. 5 words left) can't be cleanly decomposed into
// only 3s and 4s at all — in that rare, unavoidable case the remainder is
// kept together as one slightly-longer final chunk rather than emitting an
// orphan fragment.
export function splitIntoChunks(text: string, minSize = 3, maxSize = 4): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let index = 0
  while (index < words.length) {
    const remaining = words.length - index
    let size = Math.min(maxSize, remaining)
    const leftoverAfter = remaining - size
    if (leftoverAfter > 0 && leftoverAfter < minSize) {
      size = remaining - minSize
    }
    if (size < minSize) {
      size = remaining
    }
    chunks.push(words.slice(index, index + size).join(' '))
    index += size
  }
  return chunks
}

const DYNAMIC_CHUNK_SLIDING_CHUNKS: readonly string[] = DYNAMIC_CHUNK_SLIDING_SENTENCES.flatMap((sentence) =>
  splitIntoChunks(sentence),
)

export const DYNAMIC_CHUNK_SLIDING_UNITS: readonly ReadingUnit[] = DYNAMIC_CHUNK_SLIDING_CHUNKS.map((text, index) => ({
  id: `chunk-${index}`,
  text,
}))

export const TOTAL_DYNAMIC_CHUNK_SLIDING_UNITS = DYNAMIC_CHUNK_SLIDING_UNITS.length
