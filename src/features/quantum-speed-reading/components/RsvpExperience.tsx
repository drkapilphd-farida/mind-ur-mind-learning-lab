'use client'

import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { getAdjacentExercises } from '@/lib/exercises/sequence'
import { EYE_FOUNDATION_MODULE } from '../eyeFoundationModule'
import { RsvpCanvas } from './RsvpCanvas'

const RSVP_DEFINITION: ExerciseDefinition = {
  labId: 'quantum-speed-reading',
  exerciseId: 'rsvp',
  intro: {
    title: 'RSVP',
    description: "Let's practice recognizing single words at a fixed point, without moving your eyes.",
    durationLabel: 'About 45 seconds',
    postureNote: 'Sit comfortably. Keep your eyes still — let each word arrive and go without chasing it.',
  },
  completion: {
    title: 'You stayed calm and steady.',
    mentorLine: "That's the skill — recognizing words without anxiety about catching every one.",
  },
}

const { previous, next } = getAdjacentExercises(EYE_FOUNDATION_MODULE, 'rsvp')

export function RsvpExperience(): React.JSX.Element {
  return (
    <ExerciseRunner
      definition={RSVP_DEFINITION}
      Canvas={RsvpCanvas}
      labHref="/labs/quantum-speed-reading"
      previousExercise={previous}
      nextExercise={next}
    />
  )
}
