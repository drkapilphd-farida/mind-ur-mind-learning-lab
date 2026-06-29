'use client'

import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { RegressionControlCanvas } from './RegressionControlCanvas'

const REGRESSION_CONTROL_DEFINITION: ExerciseDefinition = {
  labId: 'quantum-speed-reading',
  exerciseId: 'regression-control',
  intro: {
    title: 'Regression Control',
    description: "Let's practice moving steadily forward, without looking back.",
    durationLabel: 'About 35 seconds',
    postureNote: "Sit comfortably. Follow the lead point forward — there's no need to check back.",
  },
  completion: {
    title: 'You kept moving forward.',
    mentorLine: "No backtracking needed — that forward ease is exactly what we're building.",
  },
}

export function RegressionControlExperience(): React.JSX.Element {
  return <ExerciseRunner definition={REGRESSION_CONTROL_DEFINITION} Canvas={RegressionControlCanvas} />
}
