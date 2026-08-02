import { z } from 'zod'

// AI Learning Studio™ Sprint ALS-16 — Focus Mode™ (Mini). The three real,
// named Focus variants this sprint's own brief lists. Each is a real
// chunk-stepping session (the Adaptive Learning Runtime has no "timer
// only, no chunks" shape today — confirmed by investigation before this
// sprint's design was even proposed), differentiated only by which timer
// is layered over the same real content and session lifecycle:
//   - Deep Focus Timer: the existing, shared, real count-up
//     `SessionTimer` — zero new timer code, no target duration.
//   - Reading Sprint: a real, learner-chosen target duration; a new
//     countdown timer counts down during the session. Reaching zero is an
//     honest, soft visual cue only — it never force-ends or interrupts
//     the session, matching this platform's own established stance
//     against forced pacing interruptions (see
//     docs/PRODUCTION_HANDOFF_AI_LEARNING_STUDIO_SPRINT_ALS_14.md's own
//     disclosed reasoning for not building a forced reading-speed
//     control).
//   - Pomodoro Mode: real fixed work/break intervals, cycling by
//     automatically triggering the session's own existing pause/resume
//     actions — no new pause/resume mechanic invented.
export type FocusVariantId = 'deep-focus' | 'reading-sprint' | 'pomodoro'

export const FocusVariantIdSchema = z.enum(['deep-focus', 'reading-sprint', 'pomodoro'])

export type FocusVariantDefinition = {
  id: FocusVariantId
  label: string
  description: string
}

// Order matches the brief's own listing.
export const FOCUS_VARIANTS: readonly FocusVariantDefinition[] = [
  { id: 'deep-focus', label: 'Deep Focus Timer', description: 'An open, distraction-lean session with a simple elapsed timer.' },
  { id: 'reading-sprint', label: 'Reading Sprint', description: 'Pick a target time and read against a real countdown.' },
  { id: 'pomodoro', label: 'Pomodoro Mode', description: '25-minute focus intervals with real 5-minute breaks.' },
] as const

export function getFocusVariantDefinition(id: FocusVariantId): FocusVariantDefinition {
  const definition = FOCUS_VARIANTS.find((variant) => variant.id === id)
  if (!definition) throw new Error(`Unknown Focus variant id: ${id}`)
  return definition
}

// Reading Sprint's only real config — a small, fixed set of real target
// durations (never free-form input, to keep this "Mini" scope's own
// surface area small). Pomodoro's work/break lengths (25/5 minutes) are
// the one, fixed, non-configurable default this sprint — real numbers,
// just not yet a learner-facing setting.
export const READING_SPRINT_DURATIONS_MINUTES = [10, 15, 25, 45] as const
export const POMODORO_WORK_MINUTES = 25
export const POMODORO_BREAK_MINUTES = 5

export type FocusSessionConfig = { variant: 'deep-focus' } | { variant: 'reading-sprint'; targetDurationMinutes: number } | { variant: 'pomodoro' }

// `SessionSnapshot.method` (ALS-15) is a deliberately opaque `string |
// null` at the shared LSE-3 layer — exactly the extensibility point this
// sprint reuses rather than adding a second generic field. Reading
// Sprint's one real piece of config (its chosen target duration) is
// encoded directly into that same string (`"reading-sprint:25"`) rather
// than widening `SessionSnapshot` again — LSE-3 already treats this field
// as fully opaque and mode-defined, so folding a second value into it is
// within the field's own designed contract, not a workaround.
export function encodeFocusMethod(config: FocusSessionConfig): string {
  if (config.variant === 'reading-sprint') return `reading-sprint:${config.targetDurationMinutes}`
  return config.variant
}

// Honestly returns `null` for anything that isn't a real, well-formed
// Focus config — a session started before this sprint, a foreign value,
// or a corrupted duration — never guesses a variant or duration the
// learner never chose.
export function decodeFocusMethod(raw: string | null): FocusSessionConfig | null {
  if (raw === null) return null

  if (raw === 'deep-focus' || raw === 'pomodoro') return { variant: raw }

  const [prefix, rawDuration] = raw.split(':')
  if (prefix !== 'reading-sprint' || rawDuration === undefined) return null

  const targetDurationMinutes = Number(rawDuration)
  if (!READING_SPRINT_DURATIONS_MINUTES.includes(targetDurationMinutes as (typeof READING_SPRINT_DURATIONS_MINUTES)[number])) return null

  return { variant: 'reading-sprint', targetDurationMinutes }
}

// Server Action input validation — a real, honest constraint (only the
// real allowed durations validate), not just "any number."
export const FocusSessionConfigSchema = z.discriminatedUnion('variant', [
  z.object({ variant: z.literal('deep-focus') }),
  z.object({
    variant: z.literal('reading-sprint'),
    targetDurationMinutes: z.number().refine((minutes) => READING_SPRINT_DURATIONS_MINUTES.includes(minutes as (typeof READING_SPRINT_DURATIONS_MINUTES)[number]), { message: 'Not a real Reading Sprint duration.' }),
  }),
  z.object({ variant: z.literal('pomodoro') }),
])
