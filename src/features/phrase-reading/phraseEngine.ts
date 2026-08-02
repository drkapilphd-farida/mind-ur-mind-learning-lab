// Phrase Reading™ Engine — Mission 2 of the Reading Intelligence Pack™.
// Builds a session's reading rounds from the curated meaning-cluster
// dataset (phraseClusterDataset.ts). Unlike Chunk Reading's distractors
// (any other same-length item from the wider pool) or even PCR's Brain
// Challenge distractors (other chunks from the SAME round), a Phrase
// Reading question's 3 wrong options are the OTHER, unshown members of the
// exact cluster the stimulus came from — near-identical, one word apart.
// That's the mechanism that makes this mission test meaning recognition
// instead of visual/positional recognition: a learner who only skimmed the
// topic, not the exact wording, will be tempted by a plausible near-miss.

import type { SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { PhraseCluster } from './phraseClusterDataset'
import type { PhraseChallengeType } from './phraseChallengeLibrary'

export type PhraseReadingRound = {
  phrases: string[]        // the round's Practice phase — read automatically, no interaction
  questions: SessionItem[] // exactly `questionsPerRound` Brain Challenges (normally 1)
  // The type actually used — may differ from what was requested if none of
  // this round's clusters carry the field that type needs (see
  // resolveUsableChallengeType below). The UI reads this back rather than
  // assuming the request was honored, so prompt/context copy never
  // disagrees with what's actually on screen.
  challengeType: PhraseChallengeType
}

type ShownEntry = { cluster: PhraseCluster; member: string }

// Exact Recognition and Phrase Order need nothing beyond `members`/the
// round's own shown phrases, so they're always available — the guaranteed
// fallback when a round's clusters don't support a richer type. Phrase
// Order additionally needs at least 4 shown phrases to build a 4-option
// "which came first" question.
function resolveUsableChallengeType(requested: PhraseChallengeType, shown: readonly ShownEntry[]): PhraseChallengeType {
  if (requested === 'missing-word' && shown.some((s) => s.cluster.missingWord)) return requested
  if (requested === 'phrase-completion' && shown.some((s) => s.cluster.completion)) return requested
  if (requested === 'meaning-match' && shown.some((s) => s.cluster.meaningMatch)) return requested
  if (requested === 'phrase-order' && shown.length >= 4) return requested
  return 'exact-recognition'
}

// Builds one round from an already-resolved set of clusters (the caller —
// the Experience component — decides which level/how many clusters via
// getPhraseClustersForLevel, and which Challenge Library type to request
// via pickChallengeType). Exactly one member per cluster is shown during
// Practice. Returns an empty round (never fabricates) when there aren't
// enough clusters to supply it.
export function buildPhraseReadingRound(
  clusters: readonly PhraseCluster[],
  questionsPerRound: number,
  seed: number,
  requestedType: PhraseChallengeType = 'exact-recognition',
): PhraseReadingRound {
  if (clusters.length === 0) return { phrases: [], questions: [], challengeType: 'exact-recognition' }

  const shown: ShownEntry[] = clusters.map((cluster, i) => ({
    cluster,
    member: pickItems([...cluster.members], 1, seed + i * 2003)[0] ?? cluster.members[0]!,
  }))

  const phrases = shuffleArray(shown.map((s) => s.member), seed + 90001)
  const challengeType = resolveUsableChallengeType(requestedType, shown)

  const questions = buildQuestionsForType(challengeType, shown, phrases, questionsPerRound, seed)

  return { phrases, questions, challengeType }
}

function buildQuestionsForType(
  type: PhraseChallengeType,
  shown: readonly ShownEntry[],
  phrases: readonly string[],
  questionsPerRound: number,
  seed: number,
): SessionItem[] {
  if (type === 'phrase-order') return buildPhraseOrderQuestions(phrases, questionsPerRound, seed)

  const eligibleIndices = shown
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => type === 'exact-recognition' || fieldForType(type, s.cluster) !== undefined)
    .map(({ i }) => i)

  const targetIndices = pickItems(eligibleIndices, Math.min(questionsPerRound, eligibleIndices.length), seed + 40009)

  const questions: SessionItem[] = []
  targetIndices.forEach((idx, qIdx) => {
    const questionSeed = seed + qIdx * 7919
    const question = type === 'exact-recognition'
      ? buildExactRecognitionQuestion(shown[idx]!, questionSeed, qIdx)
      : buildFieldBasedQuestion(type, shown[idx]!, questionSeed, qIdx)
    if (question !== null) questions.push(question)
  })
  return questions
}

function fieldForType(type: PhraseChallengeType, cluster: PhraseCluster): unknown {
  if (type === 'missing-word') return cluster.missingWord
  if (type === 'phrase-completion') return cluster.completion
  if (type === 'meaning-match') return cluster.meaningMatch
  return undefined
}

// Blind recall — distractors are the OTHER, unshown members of the exact
// cluster the stimulus came from, never phrases from a different cluster.
function buildExactRecognitionQuestion(entry: ShownEntry, questionSeed: number, qIdx: number): SessionItem | null {
  const { cluster, member: stimulus } = entry
  const distractorPool = cluster.members.filter((m) => m !== stimulus)
  const distractors = pickItems([...distractorPool], 3, questionSeed)
  if (distractors.length < 3) return null

  const options = shuffleArray([stimulus, ...distractors], questionSeed)
  const correctIndex = options.indexOf(stimulus)

  return {
    id: `phrase-q-exact-${qIdx}-${questionSeed}`,
    stimulus,
    stimulusLabel: `Recognition question: ${stimulus}`,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

// Missing Word / Phrase Completion / Meaning Match — each authored field's
// first option (or, for meaningMatch, its dedicated correctParaphrase
// field) is the correct answer; `stimulus` carries the context text
// (template/stem/re-shown phrase) the UI displays above the ChoiceGrid,
// since these types test productive recall or meaning transfer, not blind
// recognition of what was on screen.
function buildFieldBasedQuestion(type: PhraseChallengeType, entry: ShownEntry, questionSeed: number, qIdx: number): SessionItem | null {
  const { cluster } = entry

  let contextText: string
  let correctAnswer: string
  let distractors: readonly string[]

  if (type === 'missing-word' && cluster.missingWord) {
    contextText = cluster.missingWord.template
    correctAnswer = cluster.missingWord.options[0]!
    distractors = cluster.missingWord.options.slice(1)
  } else if (type === 'phrase-completion' && cluster.completion) {
    contextText = cluster.completion.stem
    correctAnswer = cluster.completion.options[0]!
    distractors = cluster.completion.options.slice(1)
  } else if (type === 'meaning-match' && cluster.meaningMatch) {
    contextText = entry.member
    correctAnswer = cluster.meaningMatch.correctParaphrase
    distractors = cluster.meaningMatch.distractors
  } else {
    return null
  }

  if (distractors.length < 3) return null

  const options = shuffleArray([correctAnswer, ...distractors.slice(0, 3)], questionSeed)
  const correctIndex = options.indexOf(correctAnswer)

  return {
    id: `phrase-q-${type}-${qIdx}-${questionSeed}`,
    stimulus: contextText,
    stimulusLabel: `${type} question: ${contextText}`,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

// Phrase Order — blind recall of sequence, not content. Picks 4 of the
// round's own already-shuffled Practice phrases; correct answer is
// whichever appeared EARLIEST in the actual reading order.
function buildPhraseOrderQuestions(phrases: readonly string[], questionsPerRound: number, seed: number): SessionItem[] {
  if (phrases.length < 4) return []

  const questions: SessionItem[] = []
  for (let qIdx = 0; qIdx < questionsPerRound; qIdx++) {
    const questionSeed = seed + qIdx * 7919 + 60013
    const chosenIndices = pickItems(
      phrases.map((_, i) => i),
      4,
      questionSeed,
    ).sort((a, b) => a - b)
    if (chosenIndices.length < 4) break

    const chosenPhrases = chosenIndices.map((i) => phrases[i]!)
    const earliestPhrase = chosenPhrases[0]! // chosenIndices sorted ascending, so index 0 = earliest in reading order
    const options = shuffleArray(chosenPhrases, questionSeed)
    const correctIndex = options.indexOf(earliestPhrase)

    questions.push({
      id: `phrase-q-order-${qIdx}-${questionSeed}`,
      stimulus: earliestPhrase,
      stimulusLabel: `Phrase order question: ${earliestPhrase}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    })
  }
  return questions
}

// Mastery gate for within-session level advancement — same "Level N →
// Pass → Unlock Level N+1" arithmetic PCR established, redefined here
// rather than imported (see phraseDifficulty.ts's header comment on why).
export function computePhraseLevelPassed(correctCount: number, passCount: number): boolean {
  return correctCount >= passCount
}

// ── Reading Rhythm + real WPM (Mission Complete) ──────────────────────────

export type PhraseReadingRhythm = 'Stable' | 'Accelerating' | 'Building'

export function computePhraseReadingRhythm(
  accuracyPercent: number,
  requiredAccuracyToAdvance: number,
  paceIncreasedVsPrevious: boolean | null,
): PhraseReadingRhythm {
  if (accuracyPercent < requiredAccuracyToAdvance) return 'Building'
  return paceIncreasedVsPrevious === true ? 'Accelerating' : 'Stable'
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function totalWordsInPhrases(phrases: readonly string[]): number {
  return phrases.reduce((sum, p) => sum + wordCount(p), 0)
}

export function computePhraseSessionWpm(totalWordsShown: number, totalReadingTimeMs: number): number {
  if (totalReadingTimeMs <= 0) return 0
  return Math.round((totalWordsShown / totalReadingTimeMs) * 60000)
}

export function computePhraseWpmImprovement(
  currentWpm: number,
  previousWpm: number | null,
  accuracyPercent: number,
  requiredAccuracyToAdvance: number,
): number | null {
  if (previousWpm === null) return null
  if (accuracyPercent < requiredAccuracyToAdvance) return null
  return currentWpm - previousWpm
}
