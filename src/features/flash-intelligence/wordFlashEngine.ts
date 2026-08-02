// Word Flash™ Engine — builds SessionItems directly from the curated word
// dataset and computes the Reading Speed metrics the Flash Intelligence
// Pack™ architecture review locked in (§4: every exercise must directly
// contribute to Reading Speed metrics — Recognition Speed and Estimated
// WPM Growth for Word Flash™ specifically).
//
// Pipeline: Dataset (curated words) → Visual Width Validator → pick
// stimuli + similar-length distractors from the pool → Typography Engine
// (FitText, via ChoiceGrid/FlashStimulus) → Renderer. Same shape as
// chunkEngine.ts/phraseEngine.ts — no new generation architecture.

import type { ContentItem, SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'

export type WordFlashItem = {
  text: string
  length: number
  family: string | null
}

function readFamily(item: ContentItem): string | null {
  const family = item.metadata?.['family']
  return typeof family === 'string' ? family : null
}

// Build a full session of word SessionItems from a pool of curated word
// ContentItems. Distractor selection is tiered by how genuinely
// confusable a wrong answer is — the goal is a distractor the student has
// to actually look twice at, not one that's obviously wrong by length
// alone:
//   1. Same `family` (shares a visible prefix/root, e.g. receive/receiver/
//      receives/recipe) — the most visually-similar, hardest tier.
//   2. Similar length (within 2 characters) — a weaker but still
//      meaningful proxy when no family match exists.
//   3. Any other valid word — final fallback.
// If none of the three tiers can supply 3 distinct distractors, the
// stimulus is skipped rather than paired with a fabricated option — same
// "choose another valid word, never patch with invented text" guarantee
// as Chunk/Phrase Reading.
export function buildWordFlashItems(
  words: ContentItem[],
  targetCount: number,
  seed: number,
): SessionItem[] {
  if (words.length === 0) return []

  const validWords: WordFlashItem[] = words
    .map((w) => ({ text: w.content, length: w.content.length, family: readFamily(w) }))
    .filter((word) => isVisuallyValid(word.text, 'option'))

  if (validWords.length === 0) return []

  // Case-insensitive de-duplication — the dataset never repeats a word, but
  // guards against a future author accidentally adding the same word twice.
  const seen = new Set<string>()
  const uniqueWords = validWords.filter((word) => {
    const key = word.text.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const shuffled = shuffleArray(uniqueWords, seed)
  const stimuli = shuffled.slice(0, Math.min(targetCount, shuffled.length))

  const items: SessionItem[] = []

  stimuli.forEach((word, i) => {
    const itemSeed = seed + i * 31337

    // Already counted in the family tier above — excluded from the
    // fallback tiers so a word isn't offered as a distractor twice. Only
    // meaningful when the stimulus actually has a family; when it
    // doesn't (word.family === null), nothing should be excluded on this
    // basis, since two words both lacking a family are not "the same
    // family" as each other.
    const isSameFamily = (d: WordFlashItem): boolean =>
      word.family !== null && d.family === word.family

    const sameFamilyCandidates = word.family !== null
      ? uniqueWords.filter((d) => d.text !== word.text && isSameFamily(d))
      : []
    const similarLengthCandidates = uniqueWords.filter(
      (d) => d.text !== word.text && !isSameFamily(d) && Math.abs(d.length - word.length) <= 2,
    )
    const anyOtherCandidates = uniqueWords.filter((d) => d.text !== word.text && !isSameFamily(d))

    // Deterministically fill up to 3 distractor slots from the tiers in
    // priority order — family matches first (guaranteed used whenever
    // they exist, not left to chance in a shuffled mixed pool), then
    // similar-length, then any other word. Each tier is shuffled on its
    // own so which specific words are picked still varies session to
    // session, but a real family match is never skipped in favor of a
    // weaker similar-length one.
    const distractorWords: WordFlashItem[] = []
    for (const tier of [sameFamilyCandidates, similarLengthCandidates, anyOtherCandidates]) {
      if (distractorWords.length >= 3) break
      const remaining = 3 - distractorWords.length
      const picked = pickItems(tier, remaining, itemSeed + distractorWords.length)
      distractorWords.push(...picked)
    }
    const distractors = distractorWords.map((d) => d.text)

    if (distractors.length < 3) return

    const options = shuffleArray([word.text, ...distractors], itemSeed)
    const correctIndex = options.indexOf(word.text)

    items.push({
      id: `word-flash-${i}-${itemSeed}`,
      stimulus: word.text,
      stimulusLabel: `Word: ${word.text}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    })
  })

  return items
}

// ── Reading Speed metrics (locked spec §4, §6) ─────────────────────────────

// Recognition Speed — raw recognition throughput, expressed as a
// words-per-minute-equivalent rate derived from average reaction time.
// This is a measure of how fast the student recognizes a word once it's
// visible, not a claim about continuous-text reading speed.
export function computeRecognitionSpeedWpm(averageReactionTimeMs: number): number {
  if (averageReactionTimeMs <= 0) return 0
  return Math.round(60_000 / averageReactionTimeMs)
}

// Estimated Session WPM — Recognition Speed discounted by accuracy, so a
// fast-but-wrong session doesn't read as a high number. This is the
// "Estimated" figure the locked spec requires be labeled as an estimate
// everywhere it's shown (§3, §6) — it is not a measurement of real
// continuous-text reading speed, which the platform does not currently
// measure anywhere (no WPM baseline exists yet — see the architecture
// review's Recommendation #1).
export function computeEstimatedSessionWpm(
  accuracyPercent: number,
  averageReactionTimeMs: number,
): number {
  const recognitionSpeed = computeRecognitionSpeedWpm(averageReactionTimeMs)
  return Math.round(recognitionSpeed * (Math.max(0, Math.min(100, accuracyPercent)) / 100))
}

// Estimated WPM Growth — the change in Estimated Session WPM versus the
// student's most recent prior session. Returns null when there is no
// prior session to compare against (first-ever session) — the caller is
// responsible for rendering that as "establishing your baseline," never
// as a fabricated zero or invented positive number.
export function computeEstimatedWpmGrowth(
  currentEstimatedWpm: number,
  previousEstimatedWpm: number | null,
): number | null {
  if (previousEstimatedWpm === null) return null
  return currentEstimatedWpm - previousEstimatedWpm
}

// ── Flash XP (calm, non-comparative — locked gamification model) ─────────

// Flash XP is derived directly from the session's own performanceScore
// (which already encodes accuracy + speed + difficulty multiplier — see
// DEFAULT_SCORING_RULES), scaled by how many items were actually played.
// Deliberately not an independent invented number: it's a direct,
// deterministic transformation of real session performance, never a
// fabricated or random value.
export function computeFlashXp(performanceScore: number, itemCount: number): number {
  return Math.round(performanceScore * (itemCount / 20))
}
