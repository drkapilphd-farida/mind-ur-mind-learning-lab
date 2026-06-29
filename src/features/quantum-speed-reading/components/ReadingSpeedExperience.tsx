'use client'

import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { ReadingSpeedCanvas } from './ReadingSpeedCanvas'

const READING_SPEED_DEFINITION: ExerciseDefinition = {
  labId: 'quantum-speed-reading',
  exerciseId: 'reading-speed',
  intro: {
    title: 'Reading Speed',
    description: "Let's build a smooth, comfortable reading rhythm.",
    durationLabel: 'About 35 seconds',
    postureNote: "Sit comfortably. Read each line naturally as it's highlighted — no need to rush.",
  },
  completion: {
    title: "That's a comfortable reading rhythm.",
    mentorLine: "Smooth and steady — that's exactly the foundation we're building on.",
  },
}

export function ReadingSpeedExperience(): React.JSX.Element {
  return <ExerciseRunner definition={READING_SPEED_DEFINITION} Canvas={ReadingSpeedCanvas} />
}
