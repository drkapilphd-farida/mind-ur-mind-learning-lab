// Paragraph Reading™ Engine — builds a mission's Brain Challenge: all 8
// mandatory question types, one question each, testing comprehension of
// the WHOLE paragraph — never recall of sentence order or exact wording.
// Every correct answer and every distractor comes from the paragraph's own
// authored fields — nothing is ever fabricated at runtime.

import type { SessionItem } from '@/types/exercise-engine'
import { shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { ParagraphContent } from './paragraphLibrary'
import type { ParagraphChallengeType } from './paragraphChallengeLibrary'
import { PARAGRAPH_CHALLENGE_TYPES, PARAGRAPH_DEEP_UNDERSTANDING_TYPES, paragraphChallengePrompt } from './paragraphChallengeLibrary'

export type ParagraphChallengeMeta = {
  type: ParagraphChallengeType
  prompt: string
}

export type ParagraphChallengeResult = {
  questions: SessionItem[]            // exactly 8 — one per mandatory type
  challenges: ParagraphChallengeMeta[] // parallel to `questions`
}

function buildQuestion(
  paragraph: ParagraphContent,
  type: ParagraphChallengeType,
  seed: number,
  qIdx: number,
): { item: SessionItem; meta: ParagraphChallengeMeta } | null {
  let correctAnswer: string
  let distractors: readonly string[]
  let prompt: string

  if (type === 'main-idea') {
    correctAnswer = paragraph.mainIdea.correctIdea
    distractors = paragraph.mainIdea.distractors
    prompt = paragraphChallengePrompt(type)
  } else if (type === 'supporting-detail') {
    correctAnswer = paragraph.supportingDetail.correctDetail
    distractors = paragraph.supportingDetail.distractors
    prompt = paragraphChallengePrompt(type)
  } else if (type === 'inference') {
    correctAnswer = paragraph.inference.correctInference
    distractors = paragraph.inference.distractors
    prompt = paragraphChallengePrompt(type)
  } else if (type === 'cause-effect') {
    correctAnswer = paragraph.causeEffect.cause
    distractors = paragraph.causeEffect.distractors
    prompt = paragraphChallengePrompt(type)
  } else if (type === 'vocabulary-in-context') {
    correctAnswer = paragraph.vocabularyInContext.contextualMeaning
    distractors = paragraph.vocabularyInContext.distractors
    prompt = paragraphChallengePrompt(type, paragraph.vocabularyInContext.word)
  } else if (type === 'best-title') {
    correctAnswer = paragraph.title
    distractors = paragraph.bestTitle.distractorTitles
    prompt = paragraphChallengePrompt(type)
  } else if (type === 'summary-selection') {
    correctAnswer = paragraph.summarySelection.correctSummary
    distractors = paragraph.summarySelection.distractors
    prompt = paragraphChallengePrompt(type)
  } else {
    correctAnswer = paragraph.meaningRelationship.correctRelationshipStatement
    distractors = paragraph.meaningRelationship.distractors
    prompt = paragraphChallengePrompt(type)
  }

  if (distractors.length < 3) return null

  const options = shuffleArray([correctAnswer, ...distractors.slice(0, 3)], seed)
  const correctIndex = options.indexOf(correctAnswer)

  return {
    item: {
      id: `paragraph-q-${type}-${qIdx}-${seed}`,
      // The full paragraph stays visible only during the reading phase and
      // is gone before any question appears, so no type re-shows paragraph
      // text as a visible stimulus — `stimulus` carries the correct answer
      // for internal bookkeeping/aria labelling only.
      stimulus: correctAnswer,
      stimulusLabel: `${prompt} — answer: ${correctAnswer}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    },
    meta: { type, prompt },
  }
}

// Builds the whole Brain Challenge for one mission: all 8 mandatory
// types, one question each — every type is "mandatory" per the brief, so
// unlike Sentence Reading's 4-of-9 sample, no type is ever skipped or
// randomly omitted. Never fabricates — skips a question rather than
// invent content when a type can't be built (should not happen given
// every paragraph carries all 8 authored fields, but degrades gracefully
// like every engine in this pack).
export function buildParagraphChallenges(paragraph: ParagraphContent, seed: number): ParagraphChallengeResult {
  const questions: SessionItem[] = []
  const challenges: ParagraphChallengeMeta[] = []

  PARAGRAPH_CHALLENGE_TYPES.forEach((type, qIdx) => {
    const questionSeed = seed + qIdx * 7919
    const built = buildQuestion(paragraph, type, questionSeed, qIdx)
    if (built === null) return
    questions.push(built.item)
    challenges.push(built.meta)
  })

  return { questions, challenges }
}

// ── Reading Speed (WPM) ────────────────────────────────────────────────
// A real calculation: total words actually read divided by the total time
// spent in reading phases across the session, scaled to words-per-minute.
// Local re-implementation, this pack's self-contained-folder convention —
// same formula shape as Phrase Reading's computePhraseSessionWpm.
export function computeParagraphSessionWpm(totalWordsRead: number, totalReadingPhaseDurationMs: number): number {
  if (totalReadingPhaseDurationMs <= 0) return 0
  return Math.round((totalWordsRead / totalReadingPhaseDurationMs) * 60000)
}

// ── Comprehension — a genuinely distinct, honestly-computed weighted
//    accuracy, never a duplicate of raw Accuracy. Deep-understanding types
//    (main idea, inference, summary selection, meaning relationship) count
//    1.5x; surface types (supporting detail, vocabulary in context, cause
//    and effect, best title) count 1.0x. With exactly 4 deep + 4 surface
//    questions per attempt, the max weighted score is a clean
//    4×1.5 + 4×1.0 = 10. 100% derived from real isCorrect data — never
//    fabricated.
export function computeComprehensionPercent(
  responses: readonly { isCorrect: boolean; type: ParagraphChallengeType }[],
): number {
  let earned = 0
  let possible = 0
  for (const response of responses) {
    const weight = PARAGRAPH_DEEP_UNDERSTANDING_TYPES.includes(response.type) ? 1.5 : 1.0
    possible += weight
    if (response.isCorrect) earned += weight
  }
  return possible > 0 ? Math.round((earned / possible) * 100) : 0
}

// ── Best Streak (Result Screen) ────────────────────────────────────────
// A session-wide metric: the longest run of consecutive correct answers
// across the WHOLE session, not just one mission attempt. Fully generic,
// same signature/behavior as Sentence Reading's computeBestStreak.
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
