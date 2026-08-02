import type { ReadingUnit } from '@/features/reading-engine/types'

// Sentence Reading Mode™ dataset — Quantum Speed Reading™ V2, Master Reading
// Engine mode #3 (Sprint 3.3). Deliberately its own folder/content, separate
// from the unrelated, protected V1 "Sentence Reading™" exercise (whose files
// live inline inside src/features/quantum-speed-reading/, e.g.
// sentenceEngine.ts/sentenceLibrary.ts) — no shared files, no route
// collision. Real, hand-authored, grammatically correct sentences (no AI,
// no API, no lorem ipsum), grouped into 3 progressive difficulty levels and
// ordered short-to-long so a session naturally ramps up. Each ReadingUnit is
// one COMPLETE sentence — unlike Phrase Reading Mode, content isn't chunked
// further.
const LEVEL_1_SHORT_SENTENCES: readonly string[] = [
  'Reading opens new worlds.',
  'Practice builds real skill.',
  'Small steps create lasting change.',
  'A calm mind reads best.',
  'Growth takes steady, patient time.',
  'Every page teaches something new.',
]

const LEVEL_2_MEDIUM_SENTENCES: readonly string[] = [
  'Every skilled reader started out as a curious beginner.',
  'Consistent daily practice slowly turns effort into real ability.',
  'A calm, focused mind absorbs new information far more clearly.',
  'Good readers learn to trust their eyes and keep moving forward.',
  'Curiosity often opens doors that pure discipline alone cannot reach.',
  'Confidence grows quietly through every small, honestly earned victory.',
]

const LEVEL_3_LONG_SENTENCES: readonly string[] = [
  'The most capable readers learned to trust their eyes long before they ever trusted their instincts.',
  'Progress rarely arrives as a straight line, yet it still arrives for those who keep quietly showing up.',
  'Wisdom tends to come less from reading quickly and more from reflecting honestly on what was actually learned.',
  'A single small habit, repeated patiently across many ordinary days, can slowly reshape an entire skill.',
  'The best readers stay relaxed even when a sentence grows longer and more complicated than they first expected.',
  'Real understanding grows slowly, one thoughtful sentence at a time, rather than arriving all at once.',
]

const SENTENCE_READING_MODE_SENTENCES: readonly string[] = [
  ...LEVEL_1_SHORT_SENTENCES,
  ...LEVEL_2_MEDIUM_SENTENCES,
  ...LEVEL_3_LONG_SENTENCES,
]

export const SENTENCE_READING_MODE_UNITS: readonly ReadingUnit[] = SENTENCE_READING_MODE_SENTENCES.map((text, index) => ({
  id: `sentence-${index}`,
  text,
}))

export const TOTAL_SENTENCE_READING_MODE_UNITS = SENTENCE_READING_MODE_UNITS.length
