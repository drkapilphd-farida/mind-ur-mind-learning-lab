import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  advanceCurriculumSession,
  clearActiveCurriculumSession,
  CURRICULUM_SESSION_STORAGE_KEY,
  getCurrentSessionExerciseHref,
  getCurrentSessionExerciseId,
  isSessionOnFinalExercise,
  loadActiveCurriculumSession,
  startCurriculumSession,
} from './curriculumSessionRunner'
import { buildCurriculumDayPlan } from './curriculumDatabase'

let store: Record<string, string>

beforeEach(() => {
  store = {}
  vi.stubGlobal('window', {})
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('startCurriculumSession', () => {
  it('builds a queue in Brain Gym -> Right-Brain -> Visualization -> Reading Intelligence order matching the day plan', () => {
    const plan = buildCurriculumDayPlan(5)
    const session = startCurriculumSession(5)
    const expectedIds = [
      ...plan.exercises.brainGym.map((e) => e.id),
      ...plan.exercises.rightBrainIntuition.map((e) => e.id),
      ...plan.exercises.visualization.map((e) => e.id),
      ...plan.exercises.readingIntelligence.map((e) => e.id),
    ]
    expect(session.exerciseIds).toEqual(expectedIds)
    expect(session.day).toBe(5)
    expect(session.currentIndex).toBe(0)
  })

  it('persists the session so it can be loaded back', () => {
    startCurriculumSession(3)
    const loaded = loadActiveCurriculumSession()
    expect(loaded?.day).toBe(3)
  })
})

describe('loadActiveCurriculumSession', () => {
  it('returns null when nothing is stored', () => {
    expect(loadActiveCurriculumSession()).toBeNull()
  })

  it('ignores corrupted JSON rather than throwing', () => {
    sessionStorage.setItem(CURRICULUM_SESSION_STORAGE_KEY, '{not valid json')
    expect(loadActiveCurriculumSession()).toBeNull()
  })
})

describe('clearActiveCurriculumSession', () => {
  it('removes any stored session', () => {
    startCurriculumSession(1)
    clearActiveCurriculumSession()
    expect(loadActiveCurriculumSession()).toBeNull()
  })
})

describe('getCurrentSessionExerciseId / getCurrentSessionExerciseHref', () => {
  it('resolves the current step id and a real, valid href', () => {
    const session = startCurriculumSession(1)
    const id = getCurrentSessionExerciseId(session)
    expect(id).not.toBeNull()
    const href = getCurrentSessionExerciseHref(session)
    expect(href).toMatch(/^\/labs\/quantum-speed-reading\//)
  })
})

describe('isSessionOnFinalExercise', () => {
  it('is false at the start and true on the last index', () => {
    const session = startCurriculumSession(1)
    expect(isSessionOnFinalExercise(session)).toBe(false)
    const finalSession = { ...session, currentIndex: session.exerciseIds.length - 1 }
    expect(isSessionOnFinalExercise(finalSession)).toBe(true)
  })
})

describe('advanceCurriculumSession', () => {
  it('returns null when there is no active session', () => {
    expect(advanceCurriculumSession()).toBeNull()
  })

  it('increments currentIndex and persists it', () => {
    startCurriculumSession(1)
    const advanced = advanceCurriculumSession()
    expect(advanced?.currentIndex).toBe(1)
    expect(loadActiveCurriculumSession()?.currentIndex).toBe(1)
  })

  it('clears the session and returns null once the queue is exhausted', () => {
    const session = startCurriculumSession(1)
    for (let i = 0; i < session.exerciseIds.length - 1; i++) {
      advanceCurriculumSession()
    }
    // Now at the last index — one more advance should exhaust the queue.
    const result = advanceCurriculumSession()
    expect(result).toBeNull()
    expect(loadActiveCurriculumSession()).toBeNull()
  })
})
