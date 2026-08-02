import { EyeWarmupCanvas } from './components/EyeWarmupCanvas'
import { EyeStretchCanvas } from './components/EyeStretchCanvas'
import { EyeSpanCanvas } from './components/EyeSpanCanvas'
import { RegressionControlCanvas } from './components/RegressionControlCanvas'
import { ReadingSpeedCanvas } from './components/ReadingSpeedCanvas'
import { RsvpCanvas } from './components/RsvpCanvas'
import { EYE_FOUNDATION_MODULE } from './eyeFoundationModule'

type ExerciseCanvasComponent = (props: {
  onComplete: (durationMs: number) => void
  onExit: (durationMs: number) => void
}) => React.JSX.Element

export type ReadingPreparationStep = {
  exerciseId: string
  title: string
  Canvas: ExerciseCanvasComponent
}

function titleFor(exerciseId: string): string {
  const item = EYE_FOUNDATION_MODULE.find((exercise) => exercise.exerciseId === exerciseId)
  if (item === undefined) {
    throw new Error(`Unknown Reading Preparation™ exercise id: ${exerciseId}`)
  }
  return item.title
}

// The fixed, automatic Reading Preparation™ order — reuses the same 6 Canvas
// components the standalone Eye Foundation routes already run, and the same
// titles as EYE_FOUNDATION_MODULE (single source of truth), so nothing about
// the underlying exercises is re-authored here.
export const READING_PREPARATION_STEPS: readonly ReadingPreparationStep[] = [
  { exerciseId: 'eye-warm-up', title: titleFor('eye-warm-up'), Canvas: EyeWarmupCanvas },
  { exerciseId: 'eye-stretch', title: titleFor('eye-stretch'), Canvas: EyeStretchCanvas },
  { exerciseId: 'eye-span', title: titleFor('eye-span'), Canvas: EyeSpanCanvas },
  { exerciseId: 'regression-control', title: titleFor('regression-control'), Canvas: RegressionControlCanvas },
  { exerciseId: 'reading-speed', title: titleFor('reading-speed'), Canvas: ReadingSpeedCanvas },
  { exerciseId: 'rsvp', title: titleFor('rsvp'), Canvas: RsvpCanvas },
] as const
