// The single source of truth for what the Intuition Development Hub
// lists — mirrors readingHubModes.ts's own manifest+card-grid pattern,
// but scoped to gamified intuition/ESP exercises rather than WPM/time-ms
// reading-pace modes. Purely a content/navigation manifest — no engine
// involvement, no runtime logic.
export type IntuitionHubModeStatus = 'available' | 'coming-soon'

export type IntuitionHubMode = {
  id: string
  title: string
  purpose: string
  status: IntuitionHubModeStatus
  href?: string
  exerciseId?: string
  storageKey?: string
}

export const INTUITION_HUB_MODES: readonly IntuitionHubMode[] = [
  {
    id: 'esp-zener-telepathy-sprint',
    title: 'ESP Zener Card Telepathy Sprint™',
    purpose: 'Trust your gut against a shuffled 25-card Zener deck and build streak multipliers.',
    status: 'available',
    href: '/labs/quantum-speed-reading/esp-zener-telepathy',
    exerciseId: 'esp-zener-telepathy-sprint',
    storageKey: 'qsr-esp-zener-telepathy-best',
  },
  {
    id: 'quantum-hidden-target-grid',
    title: 'Quantum Hidden Target Grid™',
    purpose: 'Tap the hidden target across a 4×4 grid, every box the target exactly once per sprint.',
    status: 'available',
    href: '/labs/quantum-speed-reading/quantum-hidden-target-grid',
    exerciseId: 'quantum-hidden-target-grid',
    storageKey: 'qsr-quantum-hidden-target-grid-best',
  },
] as const

export const INTUITION_HUB_AVAILABLE_EXERCISE_IDS: readonly string[] = INTUITION_HUB_MODES.filter(
  (mode) => mode.exerciseId !== undefined,
).map((mode) => mode.exerciseId as string)
