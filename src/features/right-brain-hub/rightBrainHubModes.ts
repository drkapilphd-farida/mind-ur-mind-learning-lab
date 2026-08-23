// The single source of truth for what the Right Brain Activation Hub
// lists — mirrors intuitionHubModes.ts's/readingHubModes.ts's own
// manifest+card-grid pattern, but scoped to gamified right-brain/visual-
// memory exercises. Purely a content/navigation manifest — no engine
// involvement, no runtime logic.
export type RightBrainHubModeStatus = 'available' | 'coming-soon'

export type RightBrainHubMode = {
  id: string
  title: string
  purpose: string
  status: RightBrainHubModeStatus
  href?: string
  exerciseId?: string
  storageKey?: string
}

export const RIGHT_BRAIN_HUB_MODES: readonly RightBrainHubMode[] = [
  {
    id: 'photographic-memory',
    title: 'Deep Visualisation Recall™',
    purpose: 'Flash-memorize a mandala, icon cluster, word/number code, or color-shape grid — then pick the exact match.',
    status: 'available',
    href: '/labs/quantum-speed-reading/photographic-memory',
    exerciseId: 'photographic-memory',
    storageKey: 'qsr-photographic-memory-best',
  },
  {
    id: 'pictorial-essence-sprint',
    title: 'High-Speed Pictorial Essence Sprint™',
    purpose: 'A glowing icon flashes for barely half a second — name its exact essence from 4 close cousins.',
    status: 'available',
    href: '/labs/quantum-speed-reading/pictorial-essence-sprint',
    exerciseId: 'pictorial-essence-sprint',
    storageKey: 'qsr-pictorial-essence-sprint-best',
  },
  {
    id: 'hemispheric-color-sync',
    title: 'Hemispheric Color-Word Sync Grid™',
    purpose: 'A color name flashes in a mismatched ink — resolve the Stroop conflict by word or by ink, on a strict timer.',
    status: 'available',
    href: '/labs/quantum-speed-reading/hemispheric-color-sync',
    exerciseId: 'hemispheric-color-sync',
    storageKey: 'qsr-hemispheric-color-sync-best',
  },
  {
    id: 'after-image-gazing',
    title: 'After-Image / Complementary Color Gazing™',
    purpose: 'Fix your gaze on a glowing shape, then notice the complementary afterimage that lingers on a neutral surface.',
    status: 'available',
    href: '/labs/quantum-speed-reading/after-image-gazing',
    exerciseId: 'after-image-gazing',
    storageKey: 'qsr-after-image-gazing-best',
  },
  {
    id: 'dot-memory-grid',
    title: 'Dot Memory Grid™',
    purpose: 'A cluster of glowing dots flashes across a grid — memorize their positions, then tap them from memory, 5 escalating rounds.',
    status: 'available',
    href: '/labs/quantum-speed-reading/dot-memory-grid',
    exerciseId: 'dot-memory-grid',
    storageKey: 'qsr-dot-memory-grid-best',
  },
  {
    id: 'number-flash-grid',
    title: 'Number Flash Grid™',
    purpose: 'Digits flash briefly across the grid — memorize both where and what they were, then tap and type them back, 5 escalating rounds.',
    status: 'available',
    href: '/labs/quantum-speed-reading/number-flash-grid',
    exerciseId: 'number-flash-grid',
    storageKey: 'qsr-number-flash-grid-best',
  },
  {
    id: 'word-flash-grid',
    title: 'Word Flash Grid™',
    purpose: 'Short, punchy words flash briefly across the grid — memorize both where and what they said, then tap and pick them back, 5 escalating rounds.',
    status: 'available',
    href: '/labs/quantum-speed-reading/word-flash-grid',
    exerciseId: 'word-flash-grid',
    storageKey: 'qsr-word-flash-grid-best',
  },
  {
    id: 'image-flash-grid',
    title: 'Image Flash Grid™',
    purpose: 'Vibrant icons flash briefly across the grid — pure photographic recall, no words or numbers, 5 escalating rounds.',
    status: 'available',
    href: '/labs/quantum-speed-reading/image-flash-grid',
    exerciseId: 'image-flash-grid',
    storageKey: 'qsr-image-flash-grid-best',
  },
] as const

export const RIGHT_BRAIN_HUB_AVAILABLE_EXERCISE_IDS: readonly string[] = RIGHT_BRAIN_HUB_MODES.filter(
  (mode) => mode.exerciseId !== undefined,
).map((mode) => mode.exerciseId as string)
