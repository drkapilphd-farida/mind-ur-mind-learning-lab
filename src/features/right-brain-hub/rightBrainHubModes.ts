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
    title: 'Photographic Memory™',
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
] as const

export const RIGHT_BRAIN_HUB_AVAILABLE_EXERCISE_IDS: readonly string[] = RIGHT_BRAIN_HUB_MODES.filter(
  (mode) => mode.exerciseId !== undefined,
).map((mode) => mode.exerciseId as string)
