// Progressive Chunk Reading™ Engine — builds a session's reading rounds
// directly from the existing curated chunk / reading-phrase pools. There
// is no splitting or generation step: every chunk or phrase is already a
// complete, meaningful unit (chunkDataset.ts / phraseDataset.ts), so this
// file only picks, sequences, and pairs content — exactly the same
// "pipeline shape" chunkEngine.ts already established for the original
// Chunk Reading exercise, adapted for rounds instead of a flat item list.
//
// A "block" here is one reading round: a batch of chunks (20 for a
// level's first round, 10 for every round after — see
// progressiveChunkReadingDifficulty.ts's progressiveChunkReadingChunksForRound)
// read with no interaction, followed by exactly ONE recognition question
// (a "Brain Challenge") whose 3 distractors are OTHER chunks from the
// SAME round — never drawn from the wider tier pool. This is deliberately
// stricter than chunkEngine.ts's same-word-count-from-anywhere distractor
// rule: testing "did you retain THIS round" requires the wrong answers to
// be things that were plausibly also just on screen, not merely
// same-length text from elsewhere in the dataset. A level is passed once
// enough of its rounds' Brain Challenges are answered correctly (see
// computeLevelPassed and PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS).

import type { ContentItem, ContentType, DifficultyTier, SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'

export type ProgressiveChunkReadingBlock = {
  tier: DifficultyTier        // which tier this specific block draws from — blocks in one
                               // session can span several tiers (see the sweep this builds from)
  chunks: string[]            // exactly `chunksPerBlock` reading-flow strings, no options/scoring
  questions: SessionItem[]    // exactly `questionsPerBlock` recognition questions, same-block distractors
}

// One block's fully-resolved content source — the caller (the Experience
// component) decides WHICH tier and WHICH content type each block uses
// (its per-block tier sweep, and — for a tier with two content types —
// which one alternates in for this particular occurrence of that tier)
// and fetches that pool. This function only builds the block from
// already-resolved input; it has no opinion on tier progression itself.
export type ProgressiveChunkReadingBlockSpec = {
  tier: DifficultyTier
  contentType: ContentType
  pool: ContentItem[]
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Builds the `questionsPerBlock` (normally 1 — one Brain Challenge per
// reading round) recognition questions for one
// already-chosen set of block chunks. Each question's stimulus is one of
// the block's own chunks; its 3 distractors are 3 OTHER chunks from the
// same block — guaranteed same word count (they're from the same tier's
// pool by construction) and, more importantly, genuinely plausible
// answers a learner who skimmed rather than read would be tempted by.
function buildBlockQuestions(blockChunks: string[], questionsPerBlock: number, seed: number): SessionItem[] {
  if (blockChunks.length < 4) return [] // need at least 1 stimulus + 3 distractors

  const targetIndices = pickItems(
    blockChunks.map((_, i) => i),
    Math.min(questionsPerBlock, blockChunks.length),
    seed,
  )

  const questions: SessionItem[] = []
  targetIndices.forEach((targetIdx, qIdx) => {
    const stimulus = blockChunks[targetIdx]!
    const questionSeed = seed + qIdx * 7919
    const distractorPool = blockChunks.filter((_, i) => i !== targetIdx)
    const distractors = pickItems(distractorPool, 3, questionSeed)
    if (distractors.length < 3) return

    const options = shuffleArray([stimulus, ...distractors], questionSeed)
    const correctIndex = options.indexOf(stimulus)

    questions.push({
      id: `pcr-q-${qIdx}-${questionSeed}`,
      stimulus,
      stimulusLabel: `Recognition question: ${stimulus}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    })
  })

  return questions
}

// Builds exactly ONE round from an already-resolved spec. `excludeChunks`
// lets the caller avoid repeating content already shown earlier THIS
// session at the same tier — rounds are generated one at a time,
// reactively, as the learner works through (and potentially retries)
// each level (see computeLevelPassed below and the Experience
// component's round-by-round generation). Returns null (never
// fabricates) when the pool can't supply a real round.
export function buildProgressiveChunkReadingBlock(
  spec: ProgressiveChunkReadingBlockSpec,
  chunksPerBlock: number,
  questionsPerBlock: number,
  seed: number,
  excludeChunks: ReadonlySet<string> = new Set(),
): ProgressiveChunkReadingBlock | null {
  const validPool = spec.pool.filter((item) => isVisuallyValid(item.content, 'option'))
  if (validPool.length === 0) return null

  // Prefer chunks not yet used elsewhere in THIS session (at this same
  // tier+type), falling back to the full pool only if that would leave
  // the block short — the same "never fabricate, degrade gracefully"
  // principle chunkEngine.ts already uses, applied across blocks instead
  // of within one.
  const freshPool = validPool.filter((item) => !excludeChunks.has(item.content))
  const candidatePool = freshPool.length >= chunksPerBlock ? freshPool : validPool
  const picked = pickItems(candidatePool, chunksPerBlock, seed)
  if (picked.length === 0) return null

  const chunks = picked.map((item) => item.content)
  const questions = buildBlockQuestions(chunks, questionsPerBlock, seed + 50021)

  return { tier: spec.tier, chunks, questions }
}

// Mastery gate for within-session level advancement — "Level N → Pass →
// Unlock Level N+1." A level is a fixed number of rounds (one Brain
// Challenge each — see progressiveChunkReadingDifficulty.ts's
// PROGRESSIVE_CHUNK_READING_LEVEL_REQUIREMENTS); this compares how many
// of THIS attempt's challenges were answered correctly against that
// level's exact required count (2/4, 3/4, 4/5, 4/5, 5/6 — the bar itself
// rises with level, not just the content difficulty).
export function computeLevelPassed(correctCount: number, passCount: number): boolean {
  return correctCount >= passCount
}

// ── Reading Rhythm + real WPM (Mission Complete) ──────────────────────────

export type ReadingRhythm = 'Stable' | 'Accelerating' | 'Building'

// Reading Rhythm is derived from two signals already available without any
// new instrumentation: this session's recognition accuracy against the
// tier's required threshold, and whether the reading pace held or
// increased since the previous session. "Stable" = comprehension is
// keeping up with an equal-or-faster pace. "Accelerating" = pace increased
// and comprehension still held. "Building" = comprehension hasn't yet
// cleared the threshold at the current pace — never labeled a false win.
export function computeReadingRhythm(
  accuracyPercent: number,
  requiredAccuracyToAdvance: number,
  paceIncreasedVsPrevious: boolean | null,
): ReadingRhythm {
  if (accuracyPercent < requiredAccuracyToAdvance) return 'Building'
  return paceIncreasedVsPrevious === true ? 'Accelerating' : 'Stable'
}

// Real, measured words-per-minute for this session — total words actually
// displayed across every reading-flow chunk, divided by the actual total
// time they were on screen. Unlike the Flash Pack's reaction-time-derived
// "Estimated WPM," this is a genuine pacing measurement: the system knows
// exactly what it showed and for how long.
export function computeSessionWpm(totalWordsShown: number, totalReadingTimeMs: number): number {
  if (totalReadingTimeMs <= 0) return 0
  return Math.round((totalWordsShown / totalReadingTimeMs) * 60000)
}

// WPM Improvement is only ever reported when this session's recognition
// accuracy met the tier's required threshold — a learner pushed faster
// who stopped comprehending should never see a congratulatory WPM figure.
// Returns null when there's no prior session (caller renders "establishing
// your baseline") or when comprehension didn't clear the bar this time.
export function computeWpmImprovement(
  currentWpm: number,
  previousWpm: number | null,
  accuracyPercent: number,
  requiredAccuracyToAdvance: number,
): number | null {
  if (previousWpm === null) return null
  if (accuracyPercent < requiredAccuracyToAdvance) return null
  return currentWpm - previousWpm
}

export function totalWordsInBlocks(blocks: readonly ProgressiveChunkReadingBlock[]): number {
  return blocks.reduce((sum, block) => sum + block.chunks.reduce((s, c) => s + wordCount(c), 0), 0)
}

// Real WPM scoped to a single round — used for the Pass/Fail screens'
// reading-pace context. Same measurement principle as computeSessionWpm,
// just over one round's chunks/duration instead of the whole session's.
export function computeBlockWpm(chunks: readonly string[], msPerWord: number, floorMs: number): number {
  const totalWords = chunks.reduce((sum, c) => sum + wordCount(c), 0)
  const totalTimeMs = chunks.reduce((sum, c) => sum + Math.max(floorMs, wordCount(c) * msPerWord), 0)
  return computeSessionWpm(totalWords, totalTimeMs)
}
