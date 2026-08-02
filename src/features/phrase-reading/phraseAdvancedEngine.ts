// Advanced Phrase Reading™ Engine — builds a round (one phrase + exactly 2
// Brain Challenges) for Phrase Reading's Level 5. Ported from Sentence
// Reading's sentenceEngine.ts: `main-idea` / `key-idea` / `idea-category`
// draw their correct answer from this phrase's own gloss/keyWord/topic,
// but their 3 distractors come from OTHER phrases in the level pool —
// never fabricated, always real authored content, pooled across phrases
// rather than drawn from one self-contained cluster (the same principle
// Levels 1-4's clusters use, applied at the level of the whole pool since
// a round only ever contains a single phrase to read).

import type { SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { AdvancedPhrase, AdvancedPhraseTopic } from './phraseAdvancedLibrary'
import type { AdvancedPhraseChallengeType } from './phraseAdvancedChallengeLibrary'
import { advancedPhraseChallengeShowsContext, advancedPhraseChallengePrompt } from './phraseAdvancedChallengeLibrary'

export type AdvancedPhraseChallengeMeta = {
  type: AdvancedPhraseChallengeType
  prompt: string
}

export type AdvancedPhraseRound = {
  questions: SessionItem[]                   // exactly `requestedTypes.length` Brain Challenges (normally 2)
  challenges: AdvancedPhraseChallengeMeta[]   // parallel to `questions`
}

const TOPIC_LABEL: Record<AdvancedPhraseTopic, string> = {
  focus: 'Focus', memory: 'Memory', recognition: 'Recognition', comprehension: 'Comprehension',
  'reading-speed': 'Reading Speed', habits: 'Habits', confidence: 'Confidence', concentration: 'Concentration',
  processing: 'Processing', fluency: 'Fluency', attention: 'Attention', consistency: 'Consistency',
  'visual-training': 'Visual Training', 'mental-clarity': 'Mental Clarity', 'skill-building': 'Skill Building',
}

// Types requiring a specific optional field fall back to a
// always-available type (main-idea) when this phrase doesn't carry it —
// never fabricates a blank/paraphrase/ending on the fly.
function resolveUsableType(requested: AdvancedPhraseChallengeType, phrase: AdvancedPhrase): AdvancedPhraseChallengeType {
  if (requested === 'missing-word' && !phrase.missingWord) return 'main-idea'
  if (requested === 'meaning-match' && !phrase.meaningMatch) return 'main-idea'
  if (requested === 'correct-ending' && !phrase.correctEnding) return 'main-idea'
  return requested
}

function buildQuestion(
  phrase: AdvancedPhrase,
  type: AdvancedPhraseChallengeType,
  otherPhrases: readonly AdvancedPhrase[],
  seed: number,
  qIdx: number,
): { item: SessionItem; meta: AdvancedPhraseChallengeMeta } | null {
  let correctAnswer: string
  let distractors: string[]
  let contextText: string | null = null

  if (type === 'main-idea') {
    correctAnswer = phrase.gloss
    distractors = pickItems(otherPhrases.map((p) => p.gloss), 3, seed)
  } else if (type === 'key-idea') {
    correctAnswer = phrase.keyWord
    distractors = pickItems(otherPhrases.map((p) => p.keyWord), 3, seed)
  } else if (type === 'idea-category') {
    correctAnswer = TOPIC_LABEL[phrase.topic]
    const otherTopicLabels = [...new Set(otherPhrases.map((p) => TOPIC_LABEL[p.topic]).filter((label) => label !== correctAnswer))]
    distractors = pickItems(otherTopicLabels, 3, seed)
  } else if (type === 'missing-word' && phrase.missingWord) {
    correctAnswer = phrase.missingWord.options[0]!
    distractors = [...phrase.missingWord.options.slice(1, 4)]
    contextText = phrase.missingWord.template
  } else if (type === 'meaning-match' && phrase.meaningMatch) {
    correctAnswer = phrase.meaningMatch.correctParaphrase
    distractors = [...phrase.meaningMatch.distractors.slice(0, 3)]
    contextText = phrase.text
  } else if (type === 'correct-ending' && phrase.correctEnding) {
    correctAnswer = phrase.correctEnding.options[0]!
    distractors = [...phrase.correctEnding.options.slice(1, 4)]
    contextText = phrase.correctEnding.stem
  } else {
    return null
  }

  if (distractors.length < 3) return null

  const options = shuffleArray([correctAnswer, ...distractors], seed)
  const correctIndex = options.indexOf(correctAnswer)
  const prompt = advancedPhraseChallengePrompt(type)
  const stimulus = advancedPhraseChallengeShowsContext(type) ? (contextText ?? phrase.text) : correctAnswer

  return {
    item: {
      id: `phrase-advanced-q-${type}-${qIdx}-${seed}`,
      stimulus,
      stimulusLabel: `${prompt} — answer: ${correctAnswer}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    },
    meta: { type, prompt },
  }
}

// Builds one round: exactly `requestedTypes.length` Brain Challenges for
// `phrase`, one per entry in `requestedTypes`. `levelPool` supplies the
// cross-phrase distractor source for main-idea/key-idea/idea-category — it
// should be the full Level 5 phrase pool, not just this round's own
// content, since a round is only ever one phrase. Never fabricates — skips
// a question rather than invent a distractor when the pool can't supply
// one.
export function buildAdvancedPhraseRound(
  phrase: AdvancedPhrase,
  levelPool: readonly AdvancedPhrase[],
  requestedTypes: readonly AdvancedPhraseChallengeType[],
  seed: number,
): AdvancedPhraseRound {
  const otherPhrases = levelPool.filter((p) => p.text !== phrase.text)
  const questions: SessionItem[] = []
  const challenges: AdvancedPhraseChallengeMeta[] = []

  requestedTypes.forEach((requested, qIdx) => {
    const type = resolveUsableType(requested, phrase)
    const questionSeed = seed + qIdx * 7919
    const built = buildQuestion(phrase, type, otherPhrases, questionSeed, qIdx)
    if (built === null) return
    questions.push(built.item)
    challenges.push(built.meta)
  })

  return { questions, challenges }
}

// Best Streak (Result Screen) — reused directly, read-only, from Sentence
// Reading's engine rather than redefined here. It's fully generic
// (`{isCorrect:boolean}[] -> number`, zero coupling to sentence-specific
// types), so duplicating it would be pure copy-paste with no isolation
// benefit — the same precedent as `computeFlashXp` being reused read-only
// from Word Flash's engine by every mission in this pack.
export { computeBestStreak } from '../quantum-speed-reading/sentenceEngine'
