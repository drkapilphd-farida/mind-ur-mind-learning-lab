// Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
// Generator™. Five structured, reusable asset record types — all
// derived, deterministically, from a single already-real
// `ChapterIntelligenceBlueprint` (Sprint-1's own output). Zero new AI.
// "Only structured assets" — no reading exercises, no UI shape here.

// Category 1, "Keywords" — the Blueprint's own `readingAssets.keywords`,
// exposed as its own lightweight asset record (deliberately simpler than
// WordAsset below — the brief lists these as two distinct categories).
export type KeywordAsset = {
  keyword: string
  learningObjectReference: string | null
}

// Category 2, "Word Assets" — individual important words, each carrying
// a real, deterministic priority (rank position within the Blueprint's
// own already-ordered `readingAssets.keywords`, never a fabricated
// score) and a real reference back to whichever Learning Object's real
// title/definition/explanation text actually contains this word.
export type WordAsset = {
  word: string
  priority: number
  learningObjectReference: string | null
}

// Category 3, "Phrase Assets" — real phrases reused verbatim from the
// Blueprint's own `readingAssets.keyPhrases` (never re-derived via
// n-grams). `phraseType` is a real, deterministic classification: does
// this phrase literally match a real Learning Object's title, a real
// definition's text, or neither.
export type PhraseAssetType = 'concept-phrase' | 'definition-phrase' | 'supporting-phrase'

export type PhraseAsset = {
  phrase: string
  phraseType: PhraseAssetType
  relatedLearningObject: string | null
}

// Category 4, "Sentence Assets" — real sentences reused verbatim from
// the Blueprint's own `readingAssets.keySentences`. `importance` is a
// real, deterministic density score (how many of the chapter's own real
// keywords/keyPhrases/definition terms this sentence contains, normalized
// 0-1) — never fabricated, never AI-scored.
export type SentenceAsset = {
  keySentence: string
  importance: number
  explanationReference: string | null
}

// Category 5, "Paragraph Assets" — real paragraphs reused verbatim from
// the Blueprint's own `readingAssets.keyParagraphs`. `paragraphId` is the
// same synthetic-but-deterministic id used on `LearningAssetObject.keyParagraphIds`.
// `summary` is a real, deterministic extractive summary (this
// paragraph's own first real sentence) — never a new AI-generated
// summary, honoring "AI thinks once."
export type ParagraphAsset = {
  paragraphId: string
  importance: number
  summary: string
  relatedLearningObjects: readonly string[]
}
