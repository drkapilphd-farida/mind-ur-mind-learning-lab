import { describe, expect, it } from 'vitest'
import { createConversationResponseGenerator } from './DefaultConversationResponseGenerator'
import { createPromptComposer } from '../promptComposition'
import { makeConversationContext, makeFixedClock } from '../testFixtures'

describe('DefaultConversationResponseGenerator', () => {
  const composer = createPromptComposer()
  const emptyMemory = { recentConversationTypes: [], totalMentorTurns: 0, lastConversationType: null }

  it('produces a complete ConversationResponse matching the Response Contract', async () => {
    const generator = createConversationResponseGenerator(makeFixedClock())
    const context = makeConversationContext({ conversationType: 'welcome', learnerName: 'Ada' })
    const promptPackage = composer.compose(context, emptyMemory)

    const response = await generator.generate(promptPackage, context)

    expect(response.title).toContain('Ada')
    expect(response.mainResponse.length).toBeGreaterThan(0)
    expect(Array.isArray(response.suggestedActions)).toBe(true)
    expect(response.metadata).toEqual({ conversationType: 'welcome', tone: 'warm', generatedAt: '2026-01-01T00:00:00.000Z' })
  })

  it('recommendedExercise always mirrors context.recommendedExercise exactly', async () => {
    const generator = createConversationResponseGenerator(makeFixedClock())
    const context = makeConversationContext({ conversationType: 'exercise-recommendation', recommendedExercise: 'memory-recall-drill' })
    const promptPackage = composer.compose(context, emptyMemory)

    const response = await generator.generate(promptPackage, context)
    expect(response.recommendedExercise).toBe('memory-recall-drill')
  })

  it('uses the tone from the given ConversationPromptPackage, not a hardcoded one', async () => {
    const generator = createConversationResponseGenerator(makeFixedClock())
    const context = makeConversationContext({ conversationType: 'progress-celebration' })
    const promptPackage = composer.compose(context, emptyMemory)

    const response = await generator.generate(promptPackage, context)
    expect(response.metadata.tone).toBe('celebratory')
  })
})
