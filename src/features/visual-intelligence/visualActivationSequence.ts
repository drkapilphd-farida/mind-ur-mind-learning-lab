import type { ExerciseSequenceItem } from '@/lib/exercises/sequence'

// Visual Activation™ — the guided sequence that replaces the old Foundation
// Journey™ + Advanced Journeys split. Single source of truth for order and
// exerciseId, reused for both progress tracking (getModuleProgress) and
// gating Reading Preparation™ behind full completion.
export const VISUAL_ACTIVATION_SEQUENCE: readonly ExerciseSequenceItem[] = [
  {
    exerciseId: 'breath-awareness',
    title: 'Breath Awareness',
    summary: 'A calm breathing rhythm to begin your visual training.',
    href: '/labs/visual-intelligence/visual-activation',
  },
  {
    exerciseId: 'eye-relaxation',
    title: 'Eye Relaxation',
    summary: 'Gentle guided eye movements to release tension.',
    href: '/labs/visual-intelligence/visual-activation',
  },
  {
    exerciseId: 'mandala-persistence',
    title: 'Mandala Persistence™',
    summary: 'Train your visual fixation using beautiful symmetrical mandalas.',
    href: '/labs/visual-intelligence/visual-activation',
  },
  {
    exerciseId: 'image-persistence-challenge',
    title: 'Image Persistence Challenge™',
    summary: 'A daily adaptive challenge across mandalas, sacred geometry, flowers, animals, objects and faces.',
    href: '/labs/visual-intelligence/visual-activation',
  },
  {
    exerciseId: 'candle-tratak',
    title: 'Candle Tratak™',
    summary: 'Train steady gaze using a realistic candle flame.',
    href: '/labs/visual-intelligence/visual-activation',
  },
  {
    exerciseId: 'advanced-tratak',
    title: 'Advanced Tratak™',
    summary: 'A longer, harder round of steady-gaze training.',
    href: '/labs/visual-intelligence/visual-activation',
  },
] as const

export const VISUAL_ACTIVATION_EXERCISE_IDS = VISUAL_ACTIVATION_SEQUENCE.map((item) => item.exerciseId)
