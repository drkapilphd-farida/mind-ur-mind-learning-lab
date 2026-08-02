import type { DifficultyTier } from '@/types/exercise-engine'
import type { ChunkExerciseAsset } from '../types/ExerciseAsset'

export type BuildChunkExerciseAssetsOptions = {
  idFactory?: (index: number) => string
  // Words per chunk — defaults to 4 ('medium', this codebase's own
  // neutral baseline tier, same reasoning as mapChunkDifficultyToTier's
  // null default). Exposed for tests and for a future sprint that might
  // want a different band per level; Tier-1 itself only ever calls this
  // with the default.
  targetWordsPerChunk?: number
}

// Word-count -> DifficultyTier bands, restating the SAME convention the
// existing, real chunkDataset.ts already establishes for its
// hand-authored content (2 words = beginner ... 6 words = expert) — not
// a new design decision, a restatement of one the existing engine
// already made, so a mixed pool of hand-authored and generated chunks
// never disagrees about what word count means which tier.
const WORD_COUNT_DIFFICULTY_BANDS: readonly { maxWords: number; tier: DifficultyTier }[] = [
  { maxWords: 2, tier: 'beginner' },
  { maxWords: 3, tier: 'easy' },
  { maxWords: 4, tier: 'medium' },
  { maxWords: 5, tier: 'advanced' },
  { maxWords: 6, tier: 'expert' },
]

function difficultyForWordCount(wordCount: number): DifficultyTier {
  const band = WORD_COUNT_DIFFICULTY_BANDS.find((candidate) => wordCount <= candidate.maxWords)
  return band?.tier ?? 'expert'
}

// A conservative, local sentence-boundary split — never a semantic
// parser, only punctuation. Good enough to keep every chunk inside one
// real sentence (see splitSentenceIntoWordWindows below); a genuinely
// malformed document (no terminal punctuation at all) still degrades to
// one long "sentence," never a crash.
function splitIntoSentences(text: string): readonly string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}

// Splits one real sentence into fixed-size, non-overlapping word windows
// — deliberately never crosses a sentence boundary, so a chunk is at
// least grammatically contained even though it isn't hand-curated for
// "independent meaningfulness" the way chunkDataset.ts's authored
// entries are. A disclosed, real limitation carried over verbatim from
// Sprint QSR-0.5/0.75 — this function does local text processing only,
// never semantic grouping.
function splitSentenceIntoWordWindows(sentence: string, windowSize: number): readonly string[] {
  const words = sentence.split(/\s+/).filter(Boolean)
  const windows: string[] = []
  for (let start = 0; start < words.length; start += windowSize) {
    const window = words.slice(start, start + windowSize)
    if (window.length > 0) windows.push(window.join(' '))
  }
  return windows
}

// Exercise Asset Builder™ — Chunk Exercise Asset. Splits real chapter
// body text into 2-6 word groups using only local text processing
// (sentence-boundary Split, then fixed-size word windows) — never AI,
// never a semantic grouping model. Word count IS the difficulty signal,
// exactly like the existing engine's own CHUNK_DIFFICULTY_PROFILES
// already treats it (Determine: Word Count -> Difficulty Tier).
export function buildChunkExerciseAssets(chapterContent: string, sourceChapterId: string, options: BuildChunkExerciseAssetsOptions = {}): readonly ChunkExerciseAsset[] {
  const idFactory = options.idFactory ?? ((index) => `${sourceChapterId}-chunk-${index}`)
  const targetWordsPerChunk = options.targetWordsPerChunk ?? 4

  const sentences = splitIntoSentences(chapterContent)
  const chunkTexts = sentences.flatMap((sentence) => splitSentenceIntoWordWindows(sentence, targetWordsPerChunk))

  return chunkTexts.map((chunkText, index) => {
    const wordCount = chunkText.split(/\s+/).filter(Boolean).length
    return {
      id: idFactory(index),
      chunkText,
      wordCount,
      difficultyTier: difficultyForWordCount(wordCount),
      sourceChapterId,
    }
  })
}
