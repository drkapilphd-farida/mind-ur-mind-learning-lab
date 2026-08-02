import type { SentenceAsset } from '@/core/universal-learning-engine/learning-assets'
import type { SentenceChapter } from '@/features/quantum-speed-reading/sentenceLibrary'

// QSR-ENGINE-SWAP-1 — real per-document `SentenceAsset[]` →
// `SentenceChapter[]`. Groups real key sentences into 5-sentence units
// (the fixed tuple size `sequence` — the one challenge type real data can
// honestly support, see sentenceEngine.ts's resolveUsableSentenceChallengeTypes
// — requires). Every other field (`theme`, `chapterTitle`, `trueStatement`,
// `chapterSummary`, `mainIdea`, `notMentioned`, `bestTitle`, `causeEffect`,
// `meaningMatch`) is deliberately left undefined: none of that
// distractor/theme content exists in real per-document data, and
// sentenceEngine.ts's own presence guards skip any type that needs it,
// never fabricating a substitute. `text`/`gloss` both use the real,
// unmodified sentence — nothing in the engine requires `gloss` to be a
// shortened paraphrase.
const SENTENCES_PER_CHAPTER = 5

export function toSentenceReadingChapters(assets: readonly SentenceAsset[], chapterId: string): SentenceChapter[] {
  const chapters: SentenceChapter[] = []
  for (let start = 0; start + SENTENCES_PER_CHAPTER <= assets.length; start += SENTENCES_PER_CHAPTER) {
    const group = assets.slice(start, start + SENTENCES_PER_CHAPTER)
    const [s0, s1, s2, s3, s4] = group
    if (!s0 || !s1 || !s2 || !s3 || !s4) break
    chapters.push({
      id: `${chapterId}-real-sentence-chapter-${chapters.length}`,
      level: 1,
      sentences: [
        { text: s0.keySentence, gloss: s0.keySentence },
        { text: s1.keySentence, gloss: s1.keySentence },
        { text: s2.keySentence, gloss: s2.keySentence },
        { text: s3.keySentence, gloss: s3.keySentence },
        { text: s4.keySentence, gloss: s4.keySentence },
      ],
    })
  }
  return chapters
}
