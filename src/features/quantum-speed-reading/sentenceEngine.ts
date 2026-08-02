// Sentence Reading™ Engine — builds a chapter's Brain Challenge: exactly
// 4 questions testing comprehension of the WHOLE 5-sentence chapter, one
// per requested type. Every correct answer and every distractor comes
// from the chapter's own authored fields (or, for `todays-topic`, the
// small fixed set of 5 level themes) — nothing is ever fabricated at
// runtime.

import type { SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { SentenceChapter } from './sentenceLibrary'
import { SENTENCE_THEME_NAME } from './sentenceLibrary'
import type { SentenceChallengeType } from './sentenceChallengeLibrary'
import { sentenceChallengePrompt } from './sentenceChallengeLibrary'

export type SentenceChallengeMeta = {
  type: SentenceChallengeType
  prompt: string
}

export type ChapterChallengeResult = {
  questions: SessionItem[]           // exactly `requestedTypes.length` Brain Challenges (normally 4)
  challenges: SentenceChallengeMeta[] // parallel to `questions`
}

function buildQuestion(
  chapter: SentenceChapter,
  type: SentenceChallengeType,
  seed: number,
  qIdx: number,
): { item: SessionItem; meta: SentenceChallengeMeta } | null {
  let correctAnswer: string
  let distractors: string[]

  // QSR-ENGINE-SWAP-1 — every branch below now guards on its own field's
  // presence first (mirrors phraseEngine.ts's own resolveUsableChallengeType).
  // Every hardcoded chapter always carries every field, so this is a no-op
  // for the standalone Lab; it's what lets a real-document chapter (whose
  // only real content is `sentences`) skip every type it can't honestly
  // support, degrading to `sequence` (see resolveUsableSentenceChallengeTypes
  // below), rather than crashing on `undefined`.
  if (type === 'todays-topic') {
    if (!chapter.theme) return null
    correctAnswer = SENTENCE_THEME_NAME[chapter.theme]
    const otherThemeNames = Object.values(SENTENCE_THEME_NAME).filter((name) => name !== correctAnswer)
    distractors = pickItems(otherThemeNames, 3, seed)
  } else if (type === 'true-statement') {
    if (!chapter.trueStatement) return null
    correctAnswer = chapter.trueStatement.trueParaphrase
    distractors = [...chapter.trueStatement.falseStatements]
  } else if (type === 'best-summary') {
    if (!chapter.chapterSummary) return null
    correctAnswer = chapter.chapterSummary.correctSummary
    distractors = [...chapter.chapterSummary.distractors]
  } else if (type === 'main-idea') {
    if (!chapter.mainIdea) return null
    correctAnswer = chapter.mainIdea.correctIdea
    distractors = [...chapter.mainIdea.distractors]
  } else if (type === 'not-mentioned') {
    if (!chapter.notMentioned) return null
    correctAnswer = chapter.notMentioned.absentIdea
    distractors = chapter.notMentioned.mentionedGlossIndices.map((i) => chapter.sentences[i].gloss)
  } else if (type === 'best-title') {
    if (!chapter.bestTitle || !chapter.chapterTitle) return null
    correctAnswer = chapter.chapterTitle
    distractors = [...chapter.bestTitle.distractorTitles]
  } else if (type === 'cause-effect') {
    if (!chapter.causeEffect) return null
    correctAnswer = chapter.causeEffect.cause
    distractors = [...chapter.causeEffect.distractors]
  } else if (type === 'meaning-match') {
    if (!chapter.meaningMatch) return null
    correctAnswer = chapter.meaningMatch.correctParaphrase
    distractors = [...chapter.meaningMatch.distractors]
  } else {
    // 'sequence' — pick 4 of the 5 sentences, correct answer is whichever
    // appeared EARLIEST in reading order. Mirrors Phrase Reading's
    // buildPhraseOrderQuestions mechanism.
    const allIndices = [0, 1, 2, 3, 4] as const
    const chosen = pickItems([...allIndices], 4, seed).sort((a, b) => a - b)
    if (chosen.length < 4) return null
    const earliestIndex = chosen[0]!
    correctAnswer = chapter.sentences[earliestIndex].gloss
    distractors = chosen.filter((i) => i !== earliestIndex).map((i) => chapter.sentences[i].gloss)
  }

  if (distractors.length < 3) return null

  const options = shuffleArray([correctAnswer, ...distractors.slice(0, 3)], seed)
  const correctIndex = options.indexOf(correctAnswer)
  const prompt = sentenceChallengePrompt(type)

  return {
    item: {
      id: `chapter-q-${type}-${qIdx}-${seed}`,
      // The reading rhythm removes every sentence from view before any
      // challenge appears, so no type re-shows chapter text as a visible
      // stimulus — `stimulus` carries the correct answer for internal
      // bookkeeping/aria labelling only.
      stimulus: correctAnswer,
      stimulusLabel: `${prompt} — answer: ${correctAnswer}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    },
    meta: { type, prompt },
  }
}

// QSR-ENGINE-SWAP-1 — the caller-facing counterpart to buildQuestion's own
// per-type presence guards above: filters which types are even worth
// requesting for a given chapter, so a real-document chapter (which only
// ever supports 'sequence') doesn't waste 3 of its usual 4 picks on types
// that would silently return null. Every hardcoded chapter supports every
// type (all fields always present), so this is a no-op there — the exact
// same "additive, zero hardcoded-mode behavior change" shape as
// phraseEngine.ts's resolveUsableChallengeType.
function isChallengeTypeSupported(chapter: SentenceChapter, type: SentenceChallengeType): boolean {
  if (type === 'sequence') return true
  if (type === 'todays-topic') return chapter.theme !== undefined
  if (type === 'true-statement') return chapter.trueStatement !== undefined
  if (type === 'best-summary') return chapter.chapterSummary !== undefined
  if (type === 'main-idea') return chapter.mainIdea !== undefined
  if (type === 'not-mentioned') return chapter.notMentioned !== undefined
  if (type === 'best-title') return chapter.bestTitle !== undefined && chapter.chapterTitle !== undefined
  if (type === 'cause-effect') return chapter.causeEffect !== undefined
  return chapter.meaningMatch !== undefined // 'meaning-match'
}

export function resolveUsableSentenceChallengeTypes(chapter: SentenceChapter, requestedTypes: readonly SentenceChallengeType[]): SentenceChallengeType[] {
  const usable = requestedTypes.filter((type) => isChallengeTypeSupported(chapter, type))
  // 'sequence' needs nothing beyond `sentences` (always real) — the one
  // type guaranteed to always be usable, so a real-document chapter never
  // ends up with zero requested types.
  return usable.length > 0 ? usable : ['sequence']
}

// Builds the whole Brain Challenge for one chapter: exactly
// `requestedTypes.length` questions (normally 4), one per requested type.
// Never fabricates — skips a question rather than invent content when a
// type can't be built (should not happen given every chapter carries all
// 8 authored fields, but degrades gracefully like every engine in this
// pack).
export function buildChapterChallenges(
  chapter: SentenceChapter,
  requestedTypes: readonly SentenceChallengeType[],
  seed: number,
): ChapterChallengeResult {
  const questions: SessionItem[] = []
  const challenges: SentenceChallengeMeta[] = []

  requestedTypes.forEach((type, qIdx) => {
    const questionSeed = seed + qIdx * 7919
    const built = buildQuestion(chapter, type, questionSeed, qIdx)
    if (built === null) return
    questions.push(built.item)
    challenges.push(built.meta)
  })

  return { questions, challenges }
}

// ── Best Streak (Result Screen) ────────────────────────────────────────
// A session-wide metric: the longest run of consecutive correct answers
// across the WHOLE session, not just one level attempt.
//
// Preserved verbatim, unchanged, across every rebuild of this mission:
// Phrase Reading's Level 5 ("Advanced Phrase Reading") does a live,
// read-only `export { computeBestStreak } from
// '../quantum-speed-reading/sentenceEngine'` — since Phrase Reading is on
// the "do not modify" list for this task, this function's name and
// signature must survive unchanged. It's fully generic
// (`{isCorrect:boolean}[] -> number`) with zero coupling to any of this
// rebuild's chapter-model changes, so preserving it costs nothing.
export function computeBestStreak(responses: readonly { isCorrect: boolean }[]): number {
  let best = 0
  let current = 0
  for (const response of responses) {
    if (response.isCorrect) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 0
    }
  }
  return best
}
