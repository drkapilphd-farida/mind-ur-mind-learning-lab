import { describe, expect, it } from 'vitest'
import { formatConversationContextSection, formatJourneyContextSection, formatMindContextSection, formatUserContextSection } from './formatContextSections'
import { makeConversationContext, makeJourneyContext, makeMindContext, makeUserContext } from '../testFixtures'

describe('formatUserContextSection', () => {
  it('renders the learner name, ageGroup, and language', () => {
    const section = formatUserContextSection(makeUserContext({ userProfile: { id: 'u1', displayName: 'Ada' }, ageGroup: 'teen', preferredLanguage: 'es' }))
    expect(section.title).toBe('User Context')
    expect(section.content).toContain('Ada')
    expect(section.content).toContain('teen')
    expect(section.content).toContain('es')
  })

  it('renders "none" for null fields', () => {
    const section = formatUserContextSection(makeUserContext({ currentJourney: null, learningGoal: null }))
    expect(section.content).toContain('Current journey: none')
    expect(section.content).toContain('Learning goal: none')
  })
})

describe('formatJourneyContextSection', () => {
  it('renders completion percent and milestones', () => {
    const section = formatJourneyContextSection(makeJourneyContext({ completionPercent: 75, previousMilestones: ['Stage 1 complete'] }))
    expect(section.content).toContain('Completion: 75%')
    expect(section.content).toContain('Stage 1 complete')
  })

  it('renders "none" for an empty milestones list', () => {
    const section = formatJourneyContextSection(makeJourneyContext({ previousMilestones: [] }))
    expect(section.content).toContain('Previous milestones: none')
  })
})

describe('formatMindContextSection', () => {
  it('renders every score', () => {
    const section = formatMindContextSection(makeMindContext({ mindScore: 99, xp: 500 }))
    expect(section.content).toContain('Mind Score: 99')
    expect(section.content).toContain('XP: 500')
  })
})

describe('formatConversationContextSection', () => {
  it('renders the current topic and pending tasks', () => {
    const section = formatConversationContextSection(makeConversationContext({ currentTopic: 'memory', pendingTasks: ['Task A'] }))
    expect(section.content).toContain('Current topic: memory')
    expect(section.content).toContain('Task A')
  })

  it('renders "none" for an empty previousQuestions list', () => {
    const section = formatConversationContextSection(makeConversationContext({ previousQuestions: [] }))
    expect(section.content).toContain('Previous questions: none')
  })
})
