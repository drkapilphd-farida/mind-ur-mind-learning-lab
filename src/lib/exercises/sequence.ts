// Generic sequence type and lookup — any future Lab defines its own ordered
// array of these and gets prev/current/next for free. Nothing here is
// Quantum Speed Reading-specific.
export type ExerciseSequenceItem = {
  exerciseId: string
  title: string
  summary: string
  href: string
}

export type AdjacentExercises = {
  previous: ExerciseSequenceItem | null
  current: ExerciseSequenceItem | null
  next: ExerciseSequenceItem | null
}

export function getAdjacentExercises(
  sequence: readonly ExerciseSequenceItem[],
  currentExerciseId: string,
): AdjacentExercises {
  const index = sequence.findIndex((item) => item.exerciseId === currentExerciseId)

  if (index === -1) {
    return { previous: null, current: null, next: null }
  }

  return {
    previous: sequence[index - 1] ?? null,
    current: sequence[index] ?? null,
    next: sequence[index + 1] ?? null,
  }
}
