// Reading Discovery Engine™ (Sprint-2 Part-1) — the locked 5-stage flow.
// "These are NOT difficulty levels. These are Reading Discovery stages."
// Never call them Easy/Medium/Hard.
export type ReadingSprintId = 'word' | 'phrase' | 'sentence' | 'paragraph' | 'meaning'

export const READING_SPRINT_ORDER: readonly ReadingSprintId[] = ['word', 'phrase', 'sentence', 'paragraph', 'meaning']

// Sprint-2.6B FIX-18 — "Meaning Sprint" read as ambiguous: users couldn't
// tell whether it was another reading mission or the question section.
// Renamed to a real, self-explanatory user-facing name — it IS the
// question section, not a speed mission, so it deliberately breaks the
// "___ Sprint™" pattern the other four (real reading) missions share.
// The internal `ReadingSprintId` literal ('meaning') is unchanged —
// this is a display-label-only rename.
export const READING_SPRINT_LABEL: Record<ReadingSprintId, string> = {
  word: 'Word Sprint™',
  phrase: 'Phrase Sprint™',
  sentence: 'Sentence Sprint™',
  paragraph: 'Paragraph Sprint™',
  meaning: 'Reading Understanding™',
}

// Sprint-2.5 FIX-04/FIX-10 — "What skill. Why it matters." A punchy
// tagline, never a full explanatory sentence — the brief's own example:
// "Mission 2 / Phrase Reading / Read Bigger. Read Smarter. / Start."
// Understandable within 3 seconds, per FIX-10's own "Less Words. More
// Impact." rule.
export const READING_SPRINT_MISSION_COPY: Record<ReadingSprintId, string> = {
  word: 'Read Words. Build Speed.',
  phrase: 'Read Bigger. Read Smarter.',
  sentence: 'Read Whole Thoughts.',
  paragraph: 'Hold Focus Longer.',
  meaning: 'Understand, Not Just Read.',
}

// The curiosity-loop headline shown on the way INTO each sprint (i.e.
// after the previous one finishes) — the brief's own example copy used
// verbatim for `phrase` and `meaning`; the other two follow the same
// "affirmation + forward-looking hook" voice. `word` has no entry — it's
// reached directly from the module's own opening `IntroCard`, not from a
// prior sprint finishing.
export const READING_SPRINT_CURIOSITY_COPY: Partial<Record<ReadingSprintId, string>> = {
  phrase: 'Great! Ready for the next challenge? Let’s see how quickly your brain recognizes phrases.',
  sentence: 'Excellent! Now let’s discover how naturally you process full sentences.',
  paragraph: 'Wonderful! Let’s see how your focus holds across a full paragraph.',
  meaning: 'Fantastic! Now let’s discover how naturally you understand meaning.',
}

// Reading Runtime Engine™ (Sprint-2 Part-2) — the locked real ranges:
// "Word Sprint: 45-60s, 25-40 words... Phrase Sprint: 45-60s, 20-30
// phrases... Sentence Sprint: 60-90s, 15-20 sentences... Paragraph
// Sprint: 90-120s, 2-4 paragraphs."
//
// Sprint-2.6B FIX-20 — "Correct flow: Paragraph Reading → Reading
// Understanding → 3–5 Questions → Results. No additional question
// screen." Paragraph Sprint's own previously-embedded 2-3 post-reading
// questions (Reading Runtime Corrections™, Sprint-2 Part-2A FIX-6) read
// as a real duplicate question experience once Reading Understanding
// asks its own separate set right after — removed here so real
// comprehension questions exist in exactly ONE place per session.
// Paragraph Sprint is pure, uninterrupted reading again, same as
// Word/Phrase/Sentence. Reading Understanding's own real question count
// is now the brief's own explicit "3–5 Questions."
export type SprintRuntimeConfig = {
  minDurationSeconds: number
  maxDurationSeconds: number
  minItems: number
  maxItems: number
}

export const SPRINT_RUNTIME_CONFIG: Record<ReadingSprintId, SprintRuntimeConfig> = {
  word: { minDurationSeconds: 45, maxDurationSeconds: 60, minItems: 25, maxItems: 40 },
  phrase: { minDurationSeconds: 45, maxDurationSeconds: 60, minItems: 20, maxItems: 30 },
  sentence: { minDurationSeconds: 60, maxDurationSeconds: 90, minItems: 15, maxItems: 20 },
  paragraph: { minDurationSeconds: 90, maxDurationSeconds: 120, minItems: 2, maxItems: 4 },
  meaning: { minDurationSeconds: 45, maxDurationSeconds: 70, minItems: 3, maxItems: 5 },
}
