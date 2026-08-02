import { describe, expect, it } from 'vitest'
import type { MentorSessionContext } from '../types/MentorSessionContext'
import { recommendMentorFocus } from './recommendMentorFocus'

const BASE_CONTEXT: MentorSessionContext = {
  learnerId: 'learner-1',
  learningProjectsCount: 1,
  readingSessionsCompleted: 3,
  memorySessionsCompleted: 3,
  memoryAverageConfidenceScore: 0.8,
  smartNotesSessionsCompleted: 3,
  documentsWithNotes: 2,
  daysSinceLastReadingSession: 1,
  daysSinceLastMemorySession: 1,
  daysSinceLastSmartNotesSession: 1,
  activeDocument: null,
}

describe('recommendMentorFocus', () => {
  it('recommends nothing for a real, recently active, fully-engaged learner', () => {
    expect(recommendMentorFocus(BASE_CONTEXT)).toEqual([])
  })

  it('recommends starting Reading when there are real zero completed sessions', () => {
    const recommendations = recommendMentorFocus({ ...BASE_CONTEXT, readingSessionsCompleted: 0, daysSinceLastReadingSession: null })
    expect(recommendations.map((r) => r.id)).toContain('start-reading')
  })

  it('recommends resuming Reading once real inactivity crosses the disclosed threshold', () => {
    const recommendations = recommendMentorFocus({ ...BASE_CONTEXT, daysSinceLastReadingSession: 5 })
    expect(recommendations.map((r) => r.id)).toContain('resume-reading')
  })

  it('never recommends resuming Reading below the real inactivity threshold', () => {
    const recommendations = recommendMentorFocus({ ...BASE_CONTEXT, daysSinceLastReadingSession: 4 })
    expect(recommendations.map((r) => r.id)).not.toContain('resume-reading')
  })

  it('recommends adding notes when real Smart Notes sessions exist but zero documents have saved notes', () => {
    const recommendations = recommendMentorFocus({ ...BASE_CONTEXT, documentsWithNotes: 0 })
    expect(recommendations.map((r) => r.id)).toContain('add-notes')
  })

  it('never recommends adding notes when there are real zero Smart Notes sessions at all', () => {
    const recommendations = recommendMentorFocus({ ...BASE_CONTEXT, smartNotesSessionsCompleted: 0, documentsWithNotes: 0, daysSinceLastSmartNotesSession: null })
    expect(recommendations.map((r) => r.id)).not.toContain('add-notes')
    expect(recommendations.map((r) => r.id)).toContain('start-smart-notes')
  })
})
