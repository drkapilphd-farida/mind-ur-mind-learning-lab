// The single source of truth for what the Visualization Development Hub
// lists — mirrors rightBrainHubModes.ts's/intuitionHubModes.ts's own
// manifest+card-grid pattern, but scoped to gamified mental-visualization
// exercises (mental rotation, spatial reasoning) rather than
// photographic-memory or ESP/intuition modes. Purely a content/navigation
// manifest — no engine involvement, no runtime logic.
export type VisualizationHubModeStatus = 'available' | 'coming-soon'

export type VisualizationHubMode = {
  id: string
  title: string
  purpose: string
  status: VisualizationHubModeStatus
  href?: string
  exerciseId?: string
  storageKey?: string
}

export const VISUALIZATION_HUB_MODES: readonly VisualizationHubMode[] = [
  {
    id: 'quantum-mental-rotation',
    title: 'Quantum Mental Object Rotation™',
    purpose: 'Memorize a colored 3D object, mentally rotate it, then recall which color ends up where.',
    status: 'available',
    href: '/labs/quantum-speed-reading/quantum-mental-rotation',
    exerciseId: 'quantum-mental-rotation',
    storageKey: 'qsr-quantum-mental-rotation-best',
  },
  {
    id: 'color-scene-transformation',
    title: 'Color & Scene Transformation Journey™',
    purpose: 'Watch a serene scene transform step by step, hold the final state in mind, then recall what it became.',
    status: 'available',
    href: '/labs/quantum-speed-reading/color-scene-transformation',
    exerciseId: 'color-scene-transformation',
    storageKey: 'qsr-color-scene-transformation-best',
  },
  {
    id: 'sensory-hologram-builder',
    title: 'Sensory Hologram Builder™',
    purpose: 'A guided, bilingual voice-narrated journey through sight, touch, and scent — building a vivid mental hologram of a life goal you choose.',
    status: 'available',
    href: '/labs/quantum-speed-reading/sensory-hologram-builder',
    exerciseId: 'sensory-hologram-builder',
    storageKey: 'qsr-sensory-hologram-builder-best',
  },
] as const

export const VISUALIZATION_HUB_AVAILABLE_EXERCISE_IDS: readonly string[] = VISUALIZATION_HUB_MODES.filter(
  (mode) => mode.exerciseId !== undefined,
).map((mode) => mode.exerciseId as string)
