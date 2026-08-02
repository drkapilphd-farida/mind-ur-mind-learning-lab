import type { ReadingUnit } from '@/features/reading-engine/types'

// Vertical Word Reading Engine™ dataset — Quantum Speed Reading™ V2, exercise
// #1 (Sprint 3.1). A brand-new, self-contained word list — deliberately not
// shared with or derived from Word Flash's dataset, per this exercise's own
// "do not reuse the old Word Flash exercise" brief. Real, hand-authored
// English words only (no AI, no API, no lorem ipsum), themed around reading,
// focus, and growth — the same vocabulary register the rest of this pack
// already uses in its own copy (e.g. stageCopy.ts's "Focus", "Growth",
// "Wisdom"). Deliberately a flat list, not lines/passages — this exercise
// reads one word at a time down a single column, not sentence-by-sentence.
export const VERTICAL_WORD_READING_WORDS: readonly string[] = [
  'Knowledge', 'Learning', 'Reading', 'Memory', 'Focus', 'Attention', 'Success', 'Growth', 'Wisdom', 'Vision',
  'Clarity', 'Insight', 'Purpose', 'Practice', 'Patience', 'Progress', 'Rhythm', 'Balance', 'Curiosity', 'Discipline',
  'Awareness', 'Presence', 'Habit', 'Momentum', 'Confidence', 'Calm', 'Stillness', 'Instinct', 'Intuition', 'Perspective',
  'Discovery', 'Direction', 'Ambition', 'Courage', 'Resilience', 'Persistence', 'Reflection', 'Understanding', 'Comprehension', 'Recognition',
  'Language', 'Vocabulary', 'Sentence', 'Meaning', 'Context', 'Structure', 'Pattern', 'Sequence', 'Flow', 'Pace',
  'Journey', 'Horizon', 'Pathway', 'Foundation', 'Framework', 'Method', 'Custom', 'Routine', 'Ritual', 'Craft',
  'Skill', 'Mastery', 'Talent', 'Aptitude', 'Ability', 'Capacity', 'Strength', 'Energy', 'Vitality', 'Endurance',
  'Silence', 'Solitude', 'Simplicity', 'Elegance', 'Precision', 'Detail', 'Depth', 'Breadth', 'Scale', 'Scope',
  'Wonder', 'Imagination', 'Creativity', 'Expression', 'Voice', 'Story', 'Narrative', 'Chapter', 'Passage', 'Paragraph',
] as const

export const TOTAL_VERTICAL_WORD_READING_WORDS = VERTICAL_WORD_READING_WORDS.length

// Sprint 3.1B — content prepared as ReadingUnit objects (Master Reading
// Engine™'s content-preparation convention) so Display Modes have a stable
// id to key by, rather than the `${word}-${index}` composite key used
// before this migration.
export const VERTICAL_WORD_READING_UNITS: readonly ReadingUnit[] = VERTICAL_WORD_READING_WORDS.map((text, index) => ({
  id: `word-${index}`,
  text,
}))
