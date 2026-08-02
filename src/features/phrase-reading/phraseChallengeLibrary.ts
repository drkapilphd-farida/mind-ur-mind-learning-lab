// Phrase Reading™ Challenge Library — one core skill (Meaning Recognition),
// multiple challenge mechanics, mixed in per level. Each type demands a
// different kind of meaning processing (see phraseEngine.ts's header for
// how each is actually built); this file only owns WHICH types are legal
// at each level and HOW one gets picked for a given round.
//
// Types 6 (Context Recognition) and 7 (Idea Recognition) are deliberately
// not here yet — both need a genuinely new, sentence-level dataset shape
// (tagged entities; idea summaries) distinct from every cluster this
// mission curates today. Scoped to a dedicated follow-up; Level 5's type
// list below gets two more entries then, with no change to this file's
// shape or to pickChallengeType's logic.

import { pickItems } from '@/lib/exercise-engine/randomizationEngine'
import type { PhraseReadingLevel } from './phraseDifficulty'

export type PhraseChallengeType =
  | 'exact-recognition'  // "Which exact phrase did you read?" — blind recall, near-miss options
  | 'missing-word'       // "Increase Reading ______" — productive recall of one word
  | 'phrase-completion'  // "Develop ______" — productive recall of the rest of the phrase
  | 'meaning-match'       // re-shown phrase -> pick the differently-worded paraphrase
  | 'phrase-order'        // blind recall of which just-read phrase came first

export const PHRASE_CHALLENGE_TYPES_BY_LEVEL: Record<PhraseReadingLevel, readonly PhraseChallengeType[]> = {
  1: ['exact-recognition', 'missing-word'],
  2: ['exact-recognition', 'missing-word', 'phrase-completion'],
  3: ['exact-recognition', 'missing-word', 'phrase-completion', 'meaning-match'],
  4: ['exact-recognition', 'missing-word', 'phrase-completion', 'meaning-match', 'phrase-order'],
  5: ['exact-recognition', 'missing-word', 'phrase-completion', 'meaning-match', 'phrase-order'],
}

export function getAllowedChallengeTypes(level: PhraseReadingLevel): readonly PhraseChallengeType[] {
  return PHRASE_CHALLENGE_TYPES_BY_LEVEL[level]
}

// Seeded pick — "Randomise Challenge Types" per session/round, deterministic
// for a given seed so retries/tests stay reproducible.
export function pickChallengeType(level: PhraseReadingLevel, seed: number): PhraseChallengeType {
  const allowed = PHRASE_CHALLENGE_TYPES_BY_LEVEL[level]
  return pickItems([...allowed], 1, seed)[0] ?? allowed[0]!
}

// Brain Challenge header/prompt copy per type. Types that re-show context
// (missing-word, phrase-completion, meaning-match) get a prompt that
// refers to what's on screen; types that test blind recall
// (exact-recognition, phrase-order) get a prompt that doesn't presuppose
// anything is re-shown.
export const PHRASE_CHALLENGE_PROMPTS: Record<PhraseChallengeType, string> = {
  'exact-recognition': 'Which exact phrase did you read?',
  'missing-word': 'Which word completes it?',
  'phrase-completion': 'Which phrase completes it?',
  'meaning-match': 'Which phrase has the same meaning?',
  'phrase-order': 'Which phrase came first?',
}

// Whether this type re-shows the target phrase/template as context above
// the ChoiceGrid (productive-recall / meaning-transfer types) or tests
// blind recall of what was already read (nothing re-shown).
export function challengeTypeShowsContext(type: PhraseChallengeType): boolean {
  return type === 'missing-word' || type === 'phrase-completion' || type === 'meaning-match'
}
