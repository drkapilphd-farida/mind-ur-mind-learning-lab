import { z } from 'zod'

export const LabIdSchema = z.enum(['quantum-speed-reading', 'memory-intelligence', 'focus-intelligence', 'visual-intelligence'])

export type LabId = z.infer<typeof LabIdSchema>

export const PracticeSessionInputSchema = z
  .object({
    labId: LabIdSchema,
    exerciseId: z.string().min(1),
    // rAF timestamps are sub-millisecond floats — not an integer by nature.
    durationMs: z.number().positive(),
    completed: z.boolean(),
  })
  .strict()

export type PracticeSessionInput = z.infer<typeof PracticeSessionInputSchema>

export type PracticeSessionResult = { success: true } | { success: false; error: string }

// Everything ExerciseRunner needs to run an exercise's intro/completion
// screens. Authoring a new exercise means writing one of these plus a
// Canvas — never re-implementing the runner itself.
export type ExerciseDefinition = {
  labId: LabId
  exerciseId: string
  intro: {
    title: string
    description: string
    durationLabel: string
    postureNote: string
  }
  completion: {
    title: string
    mentorLine: string
  }
}
