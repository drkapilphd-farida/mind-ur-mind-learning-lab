// Advanced Phrase Reading™ Challenge Library — ported verbatim in
// structure from Sentence Reading's sentenceChallengeLibrary.ts (see that
// file's header for the full rationale on why Types 4/7/8/9 of the
// original 10-type brief aren't here). Prompt copy is reworded from
// "sentence" to "phrase" since Level 5 content is phrase-length, never a
// full sentence.

export type AdvancedPhraseChallengeType = 'main-idea' | 'missing-word' | 'meaning-match' | 'correct-ending' | 'key-idea' | 'idea-category'

export const ADVANCED_PHRASE_CHALLENGE_TYPES: readonly AdvancedPhraseChallengeType[] = [
  'main-idea', 'missing-word', 'meaning-match', 'correct-ending', 'key-idea', 'idea-category',
]

// main-idea / key-idea / idea-category draw their correct answer directly
// from the phrase itself (gloss / keyWord / topic) and need no extra
// context shown. missing-word / correct-ending / meaning-match re-show a
// word/stem/gist as context, since the question IS about completing or
// matching that specific text.
export function advancedPhraseChallengeShowsContext(type: AdvancedPhraseChallengeType): boolean {
  return type === 'missing-word' || type === 'correct-ending' || type === 'meaning-match'
}

export function advancedPhraseChallengePrompt(type: AdvancedPhraseChallengeType): string {
  if (type === 'main-idea') return 'What was the phrase mainly about?'
  if (type === 'missing-word') return 'Which word completes it?'
  if (type === 'meaning-match') return 'What does it mean?'
  if (type === 'correct-ending') return 'Which ending fits?'
  if (type === 'key-idea') return 'Which word best represents the phrase?'
  return 'This phrase is mainly about:'
}
