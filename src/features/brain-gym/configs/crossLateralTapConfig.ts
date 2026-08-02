import type { BrainGymDrillConfig } from '../types'

// Cross-Lateral Tap™ — a classic Brain Gym (educational kinesiology)
// cross-body drill: a side lights up (LEFT or RIGHT), and the correct
// response is always the OPPOSITE side — a real inhibition task (overriding
// the automatic same-side response), not just a reaction-time test.
// stimulusDurationMs is 0: the prompt IS the instruction itself, so it
// shows together with the options rather than flashing and hiding first.
export const CROSS_LATERAL_TAP_CONFIG: BrainGymDrillConfig = {
  exerciseId: 'cross-lateral-tap',
  labId: 'quantum-speed-reading',
  title: 'Cross-Lateral Tap™',
  instructions: 'A side lights up — LEFT or RIGHT. Your job: tap the OPPOSITE side, every time. A classic cross-body Brain Gym drill for whole-brain coordination.',
  roundCount: 16,
  stimulusDurationMs: 0,
  storageKey: 'qsr-cross-lateral-tap-best',
  completeHeading: 'Wired Up',
  completeSubline: 'Left and right brain, working together.',
  buildRound: () => {
    const shown: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right'
    const correctOptionId: 'left' | 'right' = shown === 'left' ? 'right' : 'left'
    return {
      promptLabel: shown.toUpperCase(),
      promptContainerClassName: shown === 'left' ? 'justify-start' : 'justify-end',
      options: [
        { id: 'left', label: '← Left' },
        { id: 'right', label: 'Right →' },
      ],
      correctOptionId,
    }
  },
}
