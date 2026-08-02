// Multi-Line Reading™ Engine — builds a round (one paragraph + exactly 2
// Brain Challenges) from the curated paragraph dataset
// (multiLineParagraphDataset.ts), using the Challenge Library
// (multiLineChallengeLibrary.ts) to pick which "which line…" question type
// applies to each of the 2 targeted lines.
//
// Every question's 4 options are 4 of the SAME paragraph's own lines —
// same-source, precision-testing, the principle Phrase Reading's clusters
// and this mission share — never a line from a different paragraph.
//
// Replaces the old "which line was highlighted" mechanic entirely: this
// mission now reads the whole paragraph passively (nothing highlights),
// then tests recall of WHERE specific content lived, which is what trains
// spatial reading / eye navigation instead of visual recognition.

import type { SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { MultiLineParagraph } from './multiLineParagraphDataset'
import {
  type MultiLineChallengeType,
  multiLineChallengeShowsContext,
  multiLineChallengePrompt,
  contentWords,
  lastWord,
  lineHasNumber,
} from './multiLineChallengeLibrary'

export type MultiLineChallengeMeta = {
  type: MultiLineChallengeType
  prompt: string
}

export type MultiLineRound = {
  lines: string[]                    // the round's Practice phase — every line, shown simultaneously
  questions: SessionItem[]           // exactly `questionsPerRound` Brain Challenges (normally 2)
  challenges: MultiLineChallengeMeta[] // parallel to `questions` — which type + prompt each one used
}

function usableTypesForLine(paragraph: MultiLineParagraph, lineIndex: number): MultiLineChallengeType[] {
  const line = paragraph.lines[lineIndex]!
  const types: MultiLineChallengeType[] = ['ending-word-line']
  if (contentWords(line).length > 0) types.push('keyword-line')
  if (paragraph.personLineIndex === lineIndex) types.push('person-line')
  if (paragraph.locationLineIndex === lineIndex) types.push('location-line')
  if (lineHasNumber(line)) types.push('number-line')
  return types
}

function buildQuestionForLine(
  paragraph: MultiLineParagraph,
  lineIndex: number,
  type: MultiLineChallengeType,
  seed: number,
  qIdx: number,
): { item: SessionItem; meta: MultiLineChallengeMeta } | null {
  const lines = paragraph.lines
  const targetLine = lines[lineIndex]!
  const otherIndices = lines.map((_, i) => i).filter((i) => i !== lineIndex)
  const distractorIndices = pickItems(otherIndices, 3, seed)
  if (distractorIndices.length < 3) return null

  const optionIndices = shuffleArray([lineIndex, ...distractorIndices], seed)
  const options = optionIndices.map((i) => lines[i]!)
  const correctIndex = optionIndices.indexOf(lineIndex)

  let contextWord: string | null = null
  if (type === 'keyword-line') {
    const words = contentWords(targetLine)
    contextWord = pickItems(words, 1, seed)[0] ?? null
    if (contextWord === null) return null
  } else if (type === 'ending-word-line') {
    contextWord = lastWord(targetLine)
  }

  const prompt = multiLineChallengePrompt(type, contextWord, seed)
  // `stimulus` carries the context word for types that show one
  // (multiLineChallengeShowsContext) — the same reuse Phrase Reading's
  // engine already established for its own context-showing types.
  const stimulus = multiLineChallengeShowsContext(type) ? (contextWord ?? targetLine) : targetLine

  return {
    item: {
      id: `multiline-q-${type}-${qIdx}-${seed}`,
      stimulus,
      stimulusLabel: `${prompt} — answer: ${targetLine}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    },
    meta: { type, prompt },
  }
}

// Builds one round: the paragraph's lines (for Practice) plus exactly
// `questionsPerRound` Brain Challenges, each targeting a different line
// where possible. Never fabricates — returns fewer questions (or an empty
// round) rather than inventing content when a paragraph can't support the
// requested count.
export function buildMultiLineRound(
  paragraph: MultiLineParagraph,
  questionsPerRound: number,
  seed: number,
): MultiLineRound {
  if (paragraph.lines.length === 0) return { lines: [], questions: [], challenges: [] }

  const lineIndices = paragraph.lines.map((_, i) => i)
  const targetLineIndices = pickItems(lineIndices, Math.min(questionsPerRound, lineIndices.length), seed + 40009)

  const questions: SessionItem[] = []
  const challenges: MultiLineChallengeMeta[] = []

  targetLineIndices.forEach((lineIndex, qIdx) => {
    const usable = usableTypesForLine(paragraph, lineIndex)
    const questionSeed = seed + qIdx * 7919
    const type = pickItems(usable, 1, questionSeed)[0] ?? 'ending-word-line'
    const built = buildQuestionForLine(paragraph, lineIndex, type, questionSeed, qIdx)
    if (built === null) return
    questions.push(built.item)
    challenges.push(built.meta)
  })

  return { lines: [...paragraph.lines], questions, challenges }
}
