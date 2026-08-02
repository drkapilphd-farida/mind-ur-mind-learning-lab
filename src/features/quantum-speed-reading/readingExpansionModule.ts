import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'

// The Reading Expansion Module™ sequence — the technical name backing the
// product-facing "Core Reading Journey™" stage (same convention as
// EYE_FOUNDATION_MODULE backing "Reading Preparation™"). Gates each mission
// behind completing the one that actually precedes it (Progressive Chunk
// Reading → Phrase Reading → Multi-Line Reading → Sentence Reading →
// Paragraph Reading → Fixation Reduction, per the Reading Journey
// component). This previously pointed at the original 'chunk-reading'
// exercise, matching an older curriculum entry
// (docs/QUANTUM_SPEED_READING_CURRICULUM.md §4) written before the
// Reading Intelligence Pack's mastery-gated mission redesign; updated so
// a learner following one mission's own "Continue" link never hits a
// locked screen for a prerequisite they never took.
//
// 'sentence-reading' re-added here after its full production rebuild —
// its old implementation had briefly been absorbed into Phrase Reading's
// Level 5 ("Advanced Phrase Reading") and its own route reduced to a
// placeholder; it now has a genuinely distinct, from-scratch Idea
// Recognition mission and unlocks after Multi-Line Reading again.
//
// 'paragraph-reading' appended after 'sentence-reading' — Mission 5 of the
// Reading Intelligence Pack™, Meaning Block Recognition™. A brand-new
// cognitive stage (whole-paragraph understanding), gated behind completing
// Sentence Reading, same append-only pattern every prior mission used.
//
// SPRINT-2A — Quantum Speed Reading Library Cleanup™. 'progressive-chunk-
// reading' and 'fixation-reduction' removed from Version-1's active
// sequence (their route files and code are untouched — they just fall out
// of this array, so getExerciseAccess/deriveAvailability no longer knows
// about them and their own pages' pre-existing gate, which required Flash
// Intelligence Pack™ 100% complete, is now permanently unmet — the intended
// "hidden, not deleted" outcome). Phrase Reading is now index 0, so it
// becomes the first available exercise; phrase-reading/page.tsx gained its
// own new cross-stage gate (Visual Activation™ complete) to replace the
// gate Progressive Chunk Reading used to provide.
export const READING_EXPANSION_MODULE: readonly ExerciseSequenceItem[] = [
  {
    exerciseId: 'phrase-reading',
    title: 'Phrase Reading',
    summary: 'Recognise the exact meaning of a phrase among near-identical wording.',
    href: '/labs/quantum-speed-reading/phrase-reading',
  },
  {
    exerciseId: 'multi-line-reading',
    title: 'Multi-Line Reading',
    summary: 'Read a real paragraph, then recall exactly which line contained what.',
    href: '/labs/quantum-speed-reading/multi-line-reading',
  },
  {
    exerciseId: 'sentence-reading',
    title: 'Sentence Reading',
    summary: 'Recognise a sentence\'s complete idea instantly, without reading word by word.',
    href: '/labs/quantum-speed-reading/sentence-reading',
  },
  {
    exerciseId: 'paragraph-reading',
    title: 'Paragraph Reading',
    summary: 'Read a complete paragraph as one meaning block, then show what you understood.',
    href: '/labs/quantum-speed-reading/paragraph-reading',
  },
] as const
