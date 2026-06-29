'use client'

import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { getAdjacentExercises } from '@/lib/exercises/sequence'
import { EYE_FOUNDATION_MODULE } from '../eyeFoundationModule'
import { EyeStretchCanvas } from './EyeStretchCanvas'

const EYE_STRETCH_DEFINITION: ExerciseDefinition = {
  labId: 'quantum-speed-reading',
  exerciseId: 'eye-stretch',
  intro: {
    title: 'Eye Stretch',
    description: "Let's gently extend how far your eyes can comfortably move.",
    durationLabel: 'About 45 seconds',
    postureNote: 'Sit comfortably. Keep your head still — glance gently, then return to center.',
  },
  completion: {
    title: "You're stretched and ready.",
    mentorLine: 'Gently done — your eyes have a little more room now.',
  },
}

const { previous, next } = getAdjacentExercises(EYE_FOUNDATION_MODULE, 'eye-stretch')

export function EyeStretchExperience(): React.JSX.Element {
  return (
    <ExerciseRunner
      definition={EYE_STRETCH_DEFINITION}
      Canvas={EyeStretchCanvas}
      labHref="/labs/quantum-speed-reading"
      previousExercise={previous}
      nextExercise={next}
    />
  )
}
