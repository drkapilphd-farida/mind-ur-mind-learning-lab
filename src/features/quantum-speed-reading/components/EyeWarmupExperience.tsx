'use client'

import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { getAdjacentExercises } from '@/lib/exercises/sequence'
import { EYE_FOUNDATION_MODULE } from '../eyeFoundationModule'
import { EyeWarmupCanvas } from './EyeWarmupCanvas'

const EYE_WARM_UP_DEFINITION: ExerciseDefinition = {
  labId: 'quantum-speed-reading',
  exerciseId: 'eye-warm-up',
  intro: {
    title: 'Eye Warm-up',
    description: "Let's loosen up your eyes before we begin.",
    durationLabel: 'About 45 seconds',
    postureNote: 'Sit comfortably. Keep your head still — let your eyes do the moving.',
  },
  completion: {
    title: "You're warmed up.",
    mentorLine: 'Nice and easy — your eyes are ready.',
  },
}

const { previous, next } = getAdjacentExercises(EYE_FOUNDATION_MODULE, 'eye-warm-up')

export function EyeWarmupExperience(): React.JSX.Element {
  return (
    <ExerciseRunner
      definition={EYE_WARM_UP_DEFINITION}
      Canvas={EyeWarmupCanvas}
      labHref="/labs/quantum-speed-reading"
      previousExercise={previous}
      nextExercise={next}
    />
  )
}
