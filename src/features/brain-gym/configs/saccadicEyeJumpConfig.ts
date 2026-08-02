import type { BrainGymDrillConfig } from '../types'

// Saccadic Eye Jump™ — a dot flashes on the left or right; the instant it
// appears, tap the matching side. Trains the rapid eye jumps (saccades)
// real reading relies on. No promptContainerClassName tie-breaking needed
// beyond left/right justify — deliberately the simplest of the 4 drills.
export const SACCADIC_EYE_JUMP_CONFIG: BrainGymDrillConfig = {
  exerciseId: 'saccadic-eye-jump',
  labId: 'quantum-speed-reading',
  title: 'Saccadic Eye Jump™',
  instructions:
    'A dot flashes on the left or right. The instant it appears, tap the matching side — training the rapid eye jumps (saccades) real reading relies on.',
  roundCount: 16,
  stimulusDurationMs: 350,
  storageKey: 'qsr-saccadic-eye-jump-best',
  completeHeading: 'Jump Complete',
  completeSubline: 'Your eyes are getting faster.',
  buildRound: () => {
    const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right'
    return {
      promptLabel: '●',
      promptContainerClassName: side === 'left' ? 'justify-start' : 'justify-end',
      options: [
        { id: 'left', label: '← Left' },
        { id: 'right', label: 'Right →' },
      ],
      correctOptionId: side,
    }
  },
}
