import { describe, expect, it } from 'vitest'
import { createPromptCompositionEngine } from './DefaultPromptCompositionEngine'
import { SAFETY_RULES } from '../safetyRules'
import { makeConversationContext, makeJourneyContext, makeMentorPersona, makeMindContext, makeUserContext } from '../testFixtures'
import type { PromptCompositionInput } from '../types'

describe('DefaultPromptCompositionEngine', () => {
  const engine = createPromptCompositionEngine()

  function baseInput(): PromptCompositionInput {
    return {
      userContext: makeUserContext(),
      journeyContext: makeJourneyContext(),
      mindContext: makeMindContext(),
      conversationContext: makeConversationContext(),
      persona: makeMentorPersona(),
      safetyRules: SAFETY_RULES,
    }
  }

  it('embeds the persona system prompt fragment first in systemPrompt', () => {
    const pkg = engine.compose(baseInput())
    expect(pkg.systemPrompt.startsWith('You are a friendly, encouraging learning mentor.')).toBe(true)
  })

  it('embeds every safety rule in systemPrompt', () => {
    const pkg = engine.compose(baseInput())
    for (const rule of SAFETY_RULES) {
      expect(pkg.systemPrompt).toContain(rule.description)
    }
  })

  it('produces exactly 4 sections, one per context engine', () => {
    const pkg = engine.compose(baseInput())
    expect(pkg.sections.map((section) => section.title)).toEqual(['User Context', 'Journey Context', 'Mind Context', 'Conversation Context'])
  })

  it('carries the given persona through unchanged', () => {
    const persona = makeMentorPersona({ id: 'teacher-mode', displayName: 'Teacher Mode™' })
    const pkg = engine.compose({ ...baseInput(), persona })
    expect(pkg.persona).toBe(persona)
  })

  it('is deterministic — the same input produces byte-identical output', () => {
    const input = baseInput()
    expect(engine.compose(input)).toEqual(engine.compose(input))
  })
})
