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

// Two-Pillar Simplification™ — Fixation Reduction is Core Reading
// Journey's last exercise; its completion screen now continues into the
// 30-Day Masterclass (the app's one structured training path) instead of
// the retired Reading Intelligence hub.
const NEXT_STAGE_LINK = { title: '30-Day Masterclass', href: '/labs/quantum-speed-reading/thirty-day-curriculum' }

export function FixationReductionExperience(): React.JSX.Element {
  return (
    <ExerciseRunner
      definition={FIXATION_REDUCTION_DEFINITION}
      Canvas={FixationReductionCanvas}
      labHref="/dashboard"
      nextExercise={NEXT_STAGE_LINK}
    />
  )
}
