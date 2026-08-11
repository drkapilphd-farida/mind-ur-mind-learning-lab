// Sprint 3.3A — the single source of truth for what the Reading Hub lists.
// Purely a content/navigation manifest — no engine involvement, no runtime
// logic. Real modes point at their real, already-live routes and the exact
// localStorage keys their own orchestrators already write to (readingLocalHistory.ts,
// unmodified) — coming-soon modes have no href yet.
export type ReadingHubModeStatus = 'available' | 'coming-soon'

// Schulte Grid Speed Drill Sprint — 'time-ms' distinguishes a lower-is-
// better completion time (Schulte Grid) from the existing higher-is-
// better reading pace (every Reading Mode). Defaults to 'wpm' wherever
// omitted, so every existing entry is unaffected. See
// ReadingHubModeCard.tsx and ReadingHubProgressSummary.tsx for where this
// actually changes formatting/aggregation. (Rapid Visual Span Expander™
// originally used a third 'accuracy-percent' shape, but the WPM-Based
// Timing Sprint moved it onto real engine-driven WPM pacing, so it now
// uses the default 'wpm' shape like every Reading Mode — that third value
// was removed as dead code once nothing referenced it anymore.)
export type ReadingHubModeStatUnit = 'wpm' | 'time-ms'

export type ReadingHubMode = {
  id: string
  title: string
  purpose: string
  status: ReadingHubModeStatus
  href?: string
  exerciseId?: string
  storageKey?: string
  statUnit?: ReadingHubModeStatUnit
}

// Schulte Grid Speed Drill™ and Rapid Visual Span Expander™ moved out of
// this list — both are now Brain Gym exercises (see
// src/components/qsr/visual-activation/SchulteGridSpeedDrill.tsx and
// RapidVisualSpanExpander.tsx, wired into VISUAL_ACTIVATION_SUITE),
// reachable from the Brain Gym pillar rather than here. Their original
// engines (src/features/schulte-grid-drill/, .../rapid-visual-span-expander/)
// are untouched and still power the 21-Day Quantum Journey and the Unified
// Session's Pro rotation — only this hub's own listing/routes changed.
export const READING_HUB_MODES: readonly ReadingHubMode[] = [
  {
    id: 'dynamic-chunk-sliding',
    title: 'Dynamic Chunk Sliding™',
    purpose: 'Slide fluidly through meaningful word chunks at your target reading pace.',
    status: 'available',
    href: '/labs/quantum-speed-reading/dynamic-chunk-sliding',
    exerciseId: 'dynamic-chunk-sliding',
    storageKey: 'qsr-dynamic-chunk-sliding-best',
  },
  {
    id: 'vertical-chunk-sliding',
    title: 'Vertical Chunk Sliding™',
    purpose: 'Slide fluidly through meaningful word chunks flowing top to bottom, with a fresh topic every session.',
    status: 'available',
    href: '/labs/quantum-speed-reading/vertical-chunk-sliding',
    exerciseId: 'vertical-chunk-sliding',
    storageKey: 'qsr-vertical-chunk-sliding-best',
  },
  {
    id: 'flash-recall-sprint',
    title: 'Flash Recall & Retention Sprint™',
    purpose: 'Flash a short passage, then answer a quick question on what you retained.',
    status: 'available',
    href: '/labs/quantum-speed-reading/flash-recall-sprint',
    exerciseId: 'flash-recall-sprint',
    storageKey: 'qsr-flash-recall-sprint-best',
  },
  {
    id: 'vertical-flash-recall',
    title: 'Vertical Flash Recall & Retention Sprint™',
    purpose: 'Words flash down a fixed vertical column at your pace, training rapid vertical eye-span, then a quick retention check.',
    status: 'available',
    href: '/labs/quantum-speed-reading/vertical-flash-recall',
    exerciseId: 'vertical-flash-recall',
    storageKey: 'qsr-vertical-flash-recall-best',
  },
  {
    id: 'vertical-word-reading',
    title: 'Vertical Word Reading™',
    purpose: 'Improve instant word recognition and eye movement.',
    status: 'available',
    href: '/labs/quantum-speed-reading/vertical-word-reading',
    exerciseId: 'vertical-word-reading',
    storageKey: 'qsr-vertical-word-reading-best',
  },
  {
    id: 'phrase-reading-mode',
    title: 'Phrase Reading™',
    purpose: 'Improve chunk reading and reading flow.',
    status: 'available',
    href: '/labs/quantum-speed-reading/phrase-reading-mode',
    exerciseId: 'phrase-reading-mode',
    storageKey: 'qsr-phrase-reading-mode-best',
  },
  {
    id: 'sentence-reading-mode',
    title: 'Sentence Reading™',
    purpose: 'Improve fluent sentence processing and meaning.',
    status: 'available',
    href: '/labs/quantum-speed-reading/sentence-reading-mode',
    exerciseId: 'sentence-reading-mode',
    storageKey: 'qsr-sentence-reading-mode-best',
  },
  {
    id: 'paragraph-reading-mode',
    title: 'Paragraph Reading™',
    purpose: 'Improve extended reading endurance and comprehension.',
    status: 'available',
    href: '/labs/quantum-speed-reading/paragraph-reading-mode',
    exerciseId: 'paragraph-reading-mode',
    storageKey: 'qsr-paragraph-reading-mode-best',
  },
  {
    id: 'guided-paragraph-reading-mode',
    title: 'Guided Paragraph Reading™',
    purpose: 'Build confident, guided reading across full paragraphs.',
    status: 'available',
    href: '/labs/quantum-speed-reading/guided-paragraph-reading-mode',
    exerciseId: 'guided-paragraph-reading-mode',
    storageKey: 'qsr-guided-paragraph-reading-mode-best',
  },
] as const

export const READING_HUB_AVAILABLE_EXERCISE_IDS: readonly string[] = READING_HUB_MODES.filter(
  (mode) => mode.exerciseId !== undefined,
).map((mode) => mode.exerciseId as string)
