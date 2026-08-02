'use client'

import { ExerciseRunner } from '@/components/exercises/ExerciseRunner'
import type { ExerciseDefinition } from '@/lib/exercises/types'
import { FixationReductionCanvas } from './FixationReductionCanvas'

const FIXATION_REDUCTION_DEFINITION: ExerciseDefinition = {
  labId: 'quantum-speed-reading',
  exerciseId: 'fixation-reduction',
  intro: {
    title: 'Fixation Reduction',
    description: "Let's train your eyes to cover the same line in fewer stops.",
    durationLabel: 'About 40 seconds',
    postureNote: 'Sit comfortably. Follow the highlighted point — let your eyes jump, not drift.',
  },
  completion: {
    title: "You're covering more ground per glance.",
    mentorLine: 'Fewer stops, same line — that ease will carry into your reading.',
  },
}

// Sprint-12: Fixation Reduction is Core Reading Journey™'s (Stage 4) last
// exercise — its completion screen now continues into Reading Intelligence™
// (Stage 5), not back to the lab hub.
const NEXT_STAGE_LINK = { title: 'Reading Intelligence™', href: '/labs/quantum-speed-reading/intelligence' }

export function FixationReductionExperience(): React.JSX.Element {
  return (
    <ExerciseRunner
      definition={FIXATION_REDUCTION_DEFINITION}
      Canvas={FixationReductionCanvas}
      labHref="/labs/quantum-speed-reading"
      nextExercise={NEXT_STAGE_LINK}
    />
  )
}
