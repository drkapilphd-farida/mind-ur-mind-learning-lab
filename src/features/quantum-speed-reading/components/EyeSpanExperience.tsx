'use client'

import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { EyeSpanCanvas } from './EyeSpanCanvas'

const EYE_SPAN_DEFINITION: ExerciseDefinition = {
  labId: 'quantum-speed-reading',
  exerciseId: 'eye-span',
  intro: {
    title: 'Eye Span',
    description: "Let's see how much your eyes can take in at once, without moving them.",
    durationLabel: 'About 45 seconds',
    postureNote: 'Sit comfortably. Keep your eyes on the center dot — let things appear around it.',
  },
  completion: {
    title: "You're noticing more.",
    mentorLine: 'Calm and steady — your glance is widening.',
  },
}

export function EyeSpanExperience(): React.JSX.Element {
  return <ExerciseRunner definition={EYE_SPAN_DEFINITION} Canvas={EyeSpanCanvas} />
}
