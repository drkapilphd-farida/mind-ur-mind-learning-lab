import type { BrainGymDrillConfig } from '../types'

const QUADRANTS = [
  { id: 'top-left', label: 'Top-Left', className: 'items-start justify-start' },
  { id: 'top-right', label: 'Top-Right', className: 'items-start justify-end' },
  { id: 'bottom-left', label: 'Bottom-Left', className: 'items-end justify-start' },
  { id: 'bottom-right', label: 'Bottom-Right', className: 'items-end justify-end' },
] as const

// Peripheral Expanding Circle™ — a dot flashes briefly in one of 4
// corners around an (implied) expanding circle centered on the screen —
// somewhere in the player's peripheral vision. Without moving their eyes
// from center, they catch which corner it appeared in.
export const PERIPHERAL_EXPANDING_CIRCLE_CONFIG: BrainGymDrillConfig = {
  exerciseId: 'peripheral-expanding-circle',
  labId: 'quantum-speed-reading',
  title: 'Peripheral Expanding Circle™',
  instructions:
    'A dot flashes briefly at the edge of an expanding circle — somewhere in your peripheral vision. Without moving your eyes from center, catch which corner it appeared in.',
  roundCount: 16,
  stimulusDurationMs: 450,
  storageKey: 'qsr-peripheral-expanding-circle-best',
  completeHeading: 'Awareness Expanded',
  completeSubline: 'Your peripheral vision is sharpening.',
  buildRound: () => {
    const quadrant = QUADRANTS[Math.floor(Math.random() * QUADRANTS.length)]!
    return {
      promptLabel: '●',
      promptContainerClassName: quadrant.className,
      options: QUADRANTS.map((q) => ({ id: q.id, label: q.label })),
      correctOptionId: quadrant.id,
    }
  },
}
