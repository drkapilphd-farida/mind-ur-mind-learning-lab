import { describe, expect, it } from 'vitest'
import { createPromptComposer } from './DefaultPromptComposer'
import { makeConversationContext } from '../testFixtures'

describe('DefaultPromptComposer', () => {
  const composer = createPromptComposer()
  const emptyMemory = { recentConversationTypes: [], totalMentorTurns: 0, lastConversationType: null }

  it('embeds the mentor personality description in systemPrompt', () => {
    const pkg = composer.compose(makeConversationContext(), emptyMemory)
    expect(pkg.systemPrompt).toContain('supportive')
    expect(pkg.systemPrompt).toContain('evidence-based')
  })

  it('embeds every safety rule', () => {
    const pkg = composer.compose(makeConversationContext(), emptyMemory)
    expect(pkg.systemPrompt).toContain('Never use manipulative')
    expect(pkg.systemPrompt).toContain('Never state a fact about the learner')
  })

  it('selects tone based on conversationType', () => {
    const pkg = composer.compose(makeConversationContext({ conversationType: 'progress-celebration' }), emptyMemory)
    expect(pkg.tone).toBe('celebratory')
  })

  it('mentions the learner has no prior conversation when memory is empty', () => {
    const pkg = composer.compose(makeConversationContext(), emptyMemory)
    expect(pkg.systemPrompt).toContain("first conversation")
  })

  it('mentions the last conversation type when memory has one', () => {
    const pkg = composer.compose(makeConversationContext(), { recentConversationTypes: ['welcome'], totalMentorTurns: 1, lastConversationType: 'welcome' })
    expect(pkg.systemPrompt).toContain('"welcome"')
  })

  it('contextSummary only includes fields that are actually present', () => {
    const pkg = composer.compose(makeConversationContext({ focusSkill: null, streak: null }), emptyMemory)
    expect(pkg.contextSummary).not.toContain('Focus skill')
    expect(pkg.contextSummary).not.toContain('Streak')
  })

  it('contextSummary includes given fields', () => {
    const pkg = composer.compose(makeConversationContext({ focusSkill: 'reading', streak: 5 }), emptyMemory)
    expect(pkg.contextSummary).toContain('Focus skill: reading')
    expect(pkg.contextSummary).toContain('Streak: 5 days')
  })

  it('is deterministic — the same input produces identical output', () => {
    const context = makeConversationContext({ focusSkill: 'memory' })
    expect(composer.compose(context, emptyMemory)).toEqual(composer.compose(context, emptyMemory))
  })
})
