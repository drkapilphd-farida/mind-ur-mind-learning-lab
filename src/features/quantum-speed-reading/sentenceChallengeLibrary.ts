// Sentence Reading™ Challenge Library — chapter-level Idea Recognition.
// Every type now tests comprehension of the WHOLE 5-sentence chapter, not
// an individual sentence — the defining shift of this rebuild.
//
// 9 of the brief's 10 named types are built. Type 8 (True/False) is
// deliberately NOT here — disclosed, not stubbed: it has only 2 real
// answer options, and `ChoiceGrid` — the shared component every mission
// in this pack runs its Brain Challenge on — hardcodes exactly 4 options
// everywhere (props type, `grid-cols-2` layout, `1-4` keyboard handler).
// Changing that is a cross-cutting shared-component edit, out of scope
// for "only implement Sentence Reading."
//
// Sequence and Not-Mentioned ARE built this time (deferred in earlier
// rounds of this mission when content was a single standalone sentence) —
// a 5-sentence chapter gives enough raw material to build both as real
// 4-option questions: Sequence picks 4 of the 5 sentences' glosses and
// asks which came first (the same mechanism Phrase Reading's
// `buildPhraseOrderQuestions` already uses successfully); Not-Mentioned
// draws its 3 wrong options mechanically from real sentence glosses.

export type SentenceChallengeType =
  | 'todays-topic' | 'true-statement' | 'best-summary' | 'main-idea'
  | 'not-mentioned' | 'best-title' | 'cause-effect' | 'meaning-match' | 'sequence'

export const SENTENCE_CHALLENGE_TYPES: readonly SentenceChallengeType[] = [
  'todays-topic', 'true-statement', 'best-summary', 'main-idea',
  'not-mentioned', 'best-title', 'cause-effect', 'meaning-match', 'sequence',
]

export function sentenceChallengePrompt(type: SentenceChallengeType): string {
  if (type === 'todays-topic') return "What was today's topic?"
  if (type === 'true-statement') return 'Which statement is TRUE?'
  if (type === 'best-summary') return "Which sentence best summarizes today's lesson?"
  if (type === 'main-idea') return 'What was the main idea?'
  if (type === 'not-mentioned') return 'Which idea was NOT mentioned?'
  if (type === 'best-title') return 'Choose the best title.'
  if (type === 'cause-effect') return 'What caused this?'
  if (type === 'meaning-match') return 'Which statement means the same?'
  return 'Which sentence came first?'
}
