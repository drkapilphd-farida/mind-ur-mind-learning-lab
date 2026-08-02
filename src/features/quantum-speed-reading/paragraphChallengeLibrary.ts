// Paragraph Reading™ Challenge Library — Meaning Block Recognition™.
// Unlike Sentence Reading (4-of-9 types sampled per attempt), the brief
// calls all 8 of these types "mandatory" with no hint of a subset — every
// mission attempt asks exactly one question of each type (8
// questions/attempt). None require more or fewer than 4 options, so
// ChoiceGrid's hardcoded 4-option constraint is a non-issue here — the
// first mission in this pack with zero deferred question types.
//
// Prompts stay strictly meaning-based, never position/recall-based
// ("What was sentence 3?", "What was the fourth word?") — those belong to
// earlier missions in this pack. Paragraph Reading measures understanding.

export type ParagraphChallengeType =
  | 'main-idea'
  | 'supporting-detail'
  | 'inference'
  | 'cause-effect'
  | 'vocabulary-in-context'
  | 'best-title'
  | 'summary-selection'
  | 'meaning-relationship'

export const PARAGRAPH_CHALLENGE_TYPES: readonly ParagraphChallengeType[] = [
  'main-idea',
  'supporting-detail',
  'inference',
  'cause-effect',
  'vocabulary-in-context',
  'best-title',
  'summary-selection',
  'meaning-relationship',
]

// "Deep understanding" types are weighted more heavily than "surface"
// types when computing the Comprehension metric (see paragraphEngine.ts) —
// a genuinely distinct, honestly-computed number from raw Accuracy.
export const PARAGRAPH_DEEP_UNDERSTANDING_TYPES: readonly ParagraphChallengeType[] = [
  'main-idea', 'inference', 'summary-selection', 'meaning-relationship',
]
export const PARAGRAPH_SURFACE_TYPES: readonly ParagraphChallengeType[] = [
  'supporting-detail', 'vocabulary-in-context', 'cause-effect', 'best-title',
]

export function paragraphChallengePrompt(type: ParagraphChallengeType, word?: string): string {
  if (type === 'main-idea') return 'What is the main idea of this paragraph?'
  if (type === 'supporting-detail') return 'Which detail supports the main idea?'
  if (type === 'inference') return 'What can you reasonably infer from this paragraph?'
  if (type === 'cause-effect') return 'What caused this?'
  if (type === 'vocabulary-in-context') return `What does "${word ?? ''}" mean in this paragraph?`
  if (type === 'best-title') return 'Choose the best title for this paragraph.'
  if (type === 'summary-selection') return 'Which sentence best summarizes this paragraph?'
  return 'How do these two ideas relate to each other?'
}
