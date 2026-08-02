import type { ReadingUnit } from '@/features/reading-engine/types'

// Phrase Reading Mode™ dataset — Quantum Speed Reading™ V2, Master Reading
// Engine mode #2 (Sprint 3.2). Deliberately its own folder/content, separate
// from the unrelated, protected V1 "Phrase Reading™" exercise
// (src/features/phrase-reading/) — no shared files, no route collision.
// Real, hand-authored sentences (no AI, no API, no random word
// combinations), each split into natural 2-4 word syntactic phrase chunks
// (subject group / verb group / prepositional phrase) — the same shape as
// the brief's own "The quick brown" / "fox jumps over" / "the lazy dog"
// example. Phrase Reading trains chunk recognition, not word-by-word
// reading, so units are genuinely multi-word — this is what proves the
// Master Reading Engine's word-count-weighted pacing (computeUnitDwellMs)
// generalizes beyond Vertical Word Reading's 1-word units without any
// engine change.
const PHRASE_READING_MODE_SENTENCES: readonly (readonly string[])[] = [
  ['The quick brown', 'fox jumps over', 'the lazy dog'],
  ['Reading every day', 'builds a stronger', 'and faster mind'],
  ['Small steps taken', 'with patience and care', 'create lasting change', 'over time'],
  ['A calm mind', 'reads with more', 'clarity and speed'],
  ['Practice does not', 'make things perfect', 'it makes them', 'permanent and strong'],
  ['The best readers', 'trust their eyes', 'to move forward', 'without looking back'],
  ['Growth happens slowly', 'then all at once', 'when you keep', 'showing up'],
  ['Focus is a skill', 'you build one', 'session at a time'],
  ['Your eyes can learn', 'to see more', 'with less effort', 'than before'],
  ['Confidence grows quietly', 'behind every small', 'victory you earn'],
  ['Speed without understanding', 'is simply skimming', 'not real reading'],
  ['The mind remembers', 'what the heart', 'finds meaningful and true'],
  ['Curiosity opens doors', 'that discipline alone', 'cannot always reach'],
  ['Every expert reader', 'was once a beginner', 'who kept practicing anyway'],
  ['Stillness before reading', 'helps the mind', 'settle and absorb'],
  ['Progress is rarely', 'a straight line forward', 'without any setbacks', 'along the way'],
  ['Wisdom comes from', 'reading widely and', 'reflecting even more deeply'],
  ['The journey of', 'a thousand pages', 'begins with a', 'single word'],
] as const

const PHRASE_READING_MODE_PHRASES: readonly string[] = PHRASE_READING_MODE_SENTENCES.flat()

export const PHRASE_READING_MODE_UNITS: readonly ReadingUnit[] = PHRASE_READING_MODE_PHRASES.map((text, index) => ({
  id: `phrase-${index}`,
  text,
}))

export const TOTAL_PHRASE_READING_MODE_UNITS = PHRASE_READING_MODE_UNITS.length
