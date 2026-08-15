import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurriculumSmartCompleteHref, getCurriculumSmartExitHref, isCurriculumSessionCurrentExercise, setActiveWizardDay } from './curriculumReturnRouting'
import { startCurriculumSession, loadActiveCurriculumSession, type ActiveCurriculumSession } from './curriculumSessionRunner'
import { loadCurriculumProgress } from './curriculumProgress'

let sessionStore: Record<string, string>
let localStore: Record<string, string>

function createMemoryStorage(store: Record<string, string>): Storage {
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key]
    },
    key: () => null,
    length: 0,
  } as Storage
}

beforeEach(() => {
  sessionStore = {}
  localStore = {}
  vi.stubGlobal('window', {})
  vi.stubGlobal('sessionStorage', createMemoryStorage(sessionStore))
  vi.stubGlobal('localStorage', createMemoryStorage(localStore))
})

afterEach(() => {
  vi.unstubAllGlobals()
  setActiveWizardDay(null)
})

function firstExerciseIdForDay(day: number): string {
  const session = startCurriculumSession(day)
  return session.exerciseIds[0]!
}

describe('isCurriculumSessionCurrentExercise', () => {
  it('is false with no active session', () => {
    expect(isCurriculumSessionCurrentExercise('eye-warm-up')).toBe(false)
  })

  it('is true only for the exact current step', () => {
    const firstId = firstExerciseIdForDay(1)
    expect(isCurriculumSessionCurrentExercise(firstId)).toBe(true)
    expect(isCurriculumSessionCurrentExercise('not-the-current-exercise')).toBe(false)
  })
})

describe('getCurriculumSmartExitHref', () => {
  it('falls back to the given href when there is no matching active session', () => {
    expect(getCurriculumSmartExitHref('eye-warm-up', '/labs/quantum-speed-reading')).toBe('/labs/quantum-speed-reading')
  })

  it('returns the day view (not the fallback) and clears the session for a matching exercise', () => {
    const firstId = firstExerciseIdForDay(7)
    const href = getCurriculumSmartExitHref(firstId, '/labs/quantum-speed-reading')
    expect(href).toBe('/labs/quantum-speed-reading/thirty-day-curriculum?view=day&day=7')
    expect(loadActiveCurriculumSession()).toBeNull()
  })

  it('does not mark the day complete on an early exit', () => {
    const firstId = firstExerciseIdForDay(2)
    getCurriculumSmartExitHref(firstId, '/labs/quantum-speed-reading')
    expect(loadCurriculumProgress().completedDays).toEqual([])
  })
})

describe('getCurriculumSmartCompleteHref', () => {
  it('falls back to the given href when there is no matching active session', () => {
    expect(getCurriculumSmartCompleteHref('eye-warm-up', '/labs/quantum-speed-reading')).toBe('/labs/quantum-speed-reading')
  })

  it('on a non-final step, advances the session pointer but ALWAYS returns to the day view — never chains straight to the next exercise page', () => {
    const firstId = firstExerciseIdForDay(1)
    const href = getCurriculumSmartCompleteHref(firstId, '/labs/quantum-speed-reading')
    const session = loadActiveCurriculumSession() as ActiveCurriculumSession
    expect(session.currentIndex).toBe(1)
    expect(href).toBe('/labs/quantum-speed-reading/thirty-day-curriculum?view=day&day=1')
  })

  it('on the final exercise of a non-checkpoint day, marks the day complete, clears the session, and returns the day view with dayComplete=1', () => {
    // Day 2 is not a checkpoint day (CHECKPOINT_DAYS = [1,7,14,21,30]).
    let session = startCurriculumSession(2)
    while (session.currentIndex < session.exerciseIds.length - 1) {
      const currentId = session.exerciseIds[session.currentIndex]!
      getCurriculumSmartCompleteHref(currentId, '/labs/quantum-speed-reading')
      session = loadActiveCurriculumSession() as ActiveCurriculumSession
    }
    const finalId = session.exerciseIds[session.currentIndex]!
    const href = getCurriculumSmartCompleteHref(finalId, '/labs/quantum-speed-reading')
    expect(href).toBe('/labs/quantum-speed-reading/thirty-day-curriculum?view=day&day=2&dayComplete=1')
    expect(loadActiveCurriculumSession()).toBeNull()
    expect(loadCurriculumProgress().completedDays).toEqual([2])
  })

  it('on the final exercise of a CHECKPOINT day, does NOT mark the day complete — the assessment is still required', () => {
    // Day 1 is a checkpoint day.
    let session = startCurriculumSession(1)
    while (session.currentIndex < session.exerciseIds.length - 1) {
      const currentId = session.exerciseIds[session.currentIndex]!
      getCurriculumSmartCompleteHref(currentId, '/labs/quantum-speed-reading')
      session = loadActiveCurriculumSession() as ActiveCurriculumSession
    }
    const finalId = session.exerciseIds[session.currentIndex]!
    const href = getCurriculumSmartCompleteHref(finalId, '/labs/quantum-speed-reading')
    expect(href).toBe('/labs/quantum-speed-reading/thirty-day-curriculum?view=day&day=1')
    expect(loadActiveCurriculumSession()).toBeNull()
    expect(loadCurriculumProgress().completedDays).toEqual([])
  })
})

describe('setActiveWizardDay', () => {
  it('makes getCurriculumSmartExitHref return the day view for ANY exercise id, with no session needed', () => {
    setActiveWizardDay(12)
    expect(getCurriculumSmartExitHref('literally-anything', '/labs/quantum-speed-reading')).toBe(
      '/labs/quantum-speed-reading/thirty-day-curriculum?view=day&day=12',
    )
  })

  it('takes priority even when a real session exists for a different day', () => {
    startCurriculumSession(3)
    setActiveWizardDay(12)
    expect(getCurriculumSmartExitHref('unrelated-id', '/labs/quantum-speed-reading')).toBe(
      '/labs/quantum-speed-reading/thirty-day-curriculum?view=day&day=12',
    )
  })

  it('stops applying once cleared back to null', () => {
    setActiveWizardDay(12)
    setActiveWizardDay(null)
    expect(getCurriculumSmartExitHref('some-id', '/labs/quantum-speed-reading')).toBe('/labs/quantum-speed-reading')
  })
})
