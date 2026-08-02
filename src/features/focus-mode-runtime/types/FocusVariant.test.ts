import { describe, expect, it } from 'vitest'
import { FOCUS_VARIANTS, FocusSessionConfigSchema, FocusVariantIdSchema, READING_SPRINT_DURATIONS_MINUTES, decodeFocusMethod, encodeFocusMethod, getFocusVariantDefinition } from './FocusVariant'

describe('FocusVariant', () => {
  it('names exactly the three real Focus variants this sprint\'s own brief lists, each with a real, non-empty label and description', () => {
    expect(FOCUS_VARIANTS.map((variant) => variant.id)).toEqual(['deep-focus', 'reading-sprint', 'pomodoro'])
    for (const variant of FOCUS_VARIANTS) {
      expect(variant.label.length).toBeGreaterThan(0)
      expect(variant.description.length).toBeGreaterThan(0)
    }
  })

  it('getFocusVariantDefinition resolves each real id to its own real definition', () => {
    for (const variant of FOCUS_VARIANTS) {
      expect(getFocusVariantDefinition(variant.id)).toEqual(variant)
    }
  })

  it('FocusVariantIdSchema accepts exactly the three real ids and rejects anything else, honestly', () => {
    for (const variant of FOCUS_VARIANTS) {
      expect(FocusVariantIdSchema.safeParse(variant.id).success).toBe(true)
    }
    expect(FocusVariantIdSchema.safeParse('pomodoro-mode').success).toBe(false)
    expect(FocusVariantIdSchema.safeParse('').success).toBe(false)
  })

  it('encodeFocusMethod/decodeFocusMethod round-trip every real config without loss', () => {
    expect(decodeFocusMethod(encodeFocusMethod({ variant: 'deep-focus' }))).toEqual({ variant: 'deep-focus' })
    expect(decodeFocusMethod(encodeFocusMethod({ variant: 'pomodoro' }))).toEqual({ variant: 'pomodoro' })
    for (const targetDurationMinutes of READING_SPRINT_DURATIONS_MINUTES) {
      expect(decodeFocusMethod(encodeFocusMethod({ variant: 'reading-sprint', targetDurationMinutes }))).toEqual({ variant: 'reading-sprint', targetDurationMinutes })
    }
  })

  it('decodeFocusMethod returns null, honestly, for anything not a real, well-formed Focus config — never guesses', () => {
    expect(decodeFocusMethod(null)).toBeNull()
    expect(decodeFocusMethod('story')).toBeNull()
    expect(decodeFocusMethod('reading-sprint')).toBeNull()
    expect(decodeFocusMethod('reading-sprint:')).toBeNull()
    expect(decodeFocusMethod('reading-sprint:7')).toBeNull()
    expect(decodeFocusMethod('reading-sprint:not-a-number')).toBeNull()
    expect(decodeFocusMethod('')).toBeNull()
  })

  it('FocusSessionConfigSchema validates real Server Action input, rejecting an unreal Reading Sprint duration', () => {
    expect(FocusSessionConfigSchema.safeParse({ variant: 'deep-focus' }).success).toBe(true)
    expect(FocusSessionConfigSchema.safeParse({ variant: 'pomodoro' }).success).toBe(true)
    expect(FocusSessionConfigSchema.safeParse({ variant: 'reading-sprint', targetDurationMinutes: 25 }).success).toBe(true)
    expect(FocusSessionConfigSchema.safeParse({ variant: 'reading-sprint', targetDurationMinutes: 7 }).success).toBe(false)
    expect(FocusSessionConfigSchema.safeParse({ variant: 'reading-sprint' }).success).toBe(false)
  })
})
