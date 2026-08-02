import { describe, expect, it } from 'vitest'
import { LEARNING_MODES, isLearningModeAvailable, resolveLearningModeHref } from './learningModes'
import type { LearningModeDefinition } from './learningModes'

function modeById(id: string): LearningModeDefinition {
  const mode = LEARNING_MODES.find((candidate) => candidate.id === id)
  if (!mode) throw new Error(`Expected a Learning Mode with id "${id}"`)
  return mode
}

describe('resolveLearningModeHref', () => {
  it('routes the two real generic-workspace Learning Modes to the real universal Learning Workspace™', () => {
    expect(resolveLearningModeHref(modeById('memory-mode'), 'project-1')).toBe('/preview/learning-projects/project-1/workspace?mode=memory-mode')
    expect(resolveLearningModeHref(modeById('smart-notes'), 'project-1')).toBe('/preview/learning-projects/project-1/workspace?mode=smart-notes')
  })

  it('routes AI Mentor™ directly to its own real, non-project-scoped route', () => {
    expect(resolveLearningModeHref(modeById('ai-mentor'), 'project-1')).toBe('/preview/ai-mentor')
  })

  it('routes Quantum Speed Reading™ directly to the real Quantum Reading Journey, not the generic workspace shell', () => {
    expect(resolveLearningModeHref(modeById('quantum-speed-reading'), 'project-1')).toBe('/preview/learning-projects/project-1/quantum-journey')
  })

  it('routes every Learning Mode with no real runtime yet through the same universal Learning Workspace™, never null and never a stale demo link', () => {
    for (const id of ['mind-map', 'flashcards', 'mcqs', 'revision-mode', 'research-mode', 'exam-prep']) {
      expect(resolveLearningModeHref(modeById(id), 'project-1')).toBe(`/preview/learning-projects/project-1/workspace?mode=${id}`)
    }
  })

  it('varies the real workspace href with the real project id', () => {
    expect(resolveLearningModeHref(modeById('memory-mode'), 'project-a')).not.toBe(resolveLearningModeHref(modeById('memory-mode'), 'project-b'))
  })
})

describe('isLearningModeAvailable', () => {
  it('reports Research Mode™ as available, ALS-24 — it gained a real runtime this sprint', () => {
    expect(isLearningModeAvailable('research-mode')).toBe(true)
  })

  it('still reports Exam Preparation™ as unavailable — no real runtime exists for it yet', () => {
    expect(isLearningModeAvailable('exam-prep')).toBe(false)
  })

  it('reports every mode with a real, existing runtime as available', () => {
    for (const id of ['quantum-speed-reading', 'memory-mode', 'smart-notes', 'focus-mode', 'mind-map', 'flashcards', 'mcqs', 'revision-mode', 'ai-mentor'] as const) {
      expect(isLearningModeAvailable(id)).toBe(true)
    }
  })
})
