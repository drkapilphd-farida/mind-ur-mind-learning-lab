import { describe, expect, it, vi } from 'vitest'
import { createAIIntelligenceLayer } from './createAIIntelligenceLayer'
import type { MentorPersonaEngine } from './contracts'
import { makeMentorPersona } from './testFixtures'

describe('createAIIntelligenceLayer (end-to-end, real default engines)', () => {
  it('builds a complete PromptPackage from partial context input', () => {
    const layer = createAIIntelligenceLayer()

    const pkg = layer.buildPromptPackage({
      userContext: { userProfile: { id: 'u1', displayName: 'Ada' }, currentLab: 'quantum-speed-reading' },
      mindContext: { mindScore: 55 },
      journeyContext: { completionPercent: 30 },
      conversationContext: { currentTopic: 'reading speed' },
    })

    expect(pkg.persona.id).toBe('reading-coach')
    expect(pkg.sections).toHaveLength(4)
    expect(pkg.sections.find((section) => section.title === 'User Context')?.content).toContain('Ada')
    expect(pkg.sections.find((section) => section.title === 'Mind Context')?.content).toContain('55')
    expect(pkg.systemPrompt).toContain('No medical advice.')
  })

  it('derives persona selection from the built UserContext (currentLab, ageGroup), not a duplicate input', () => {
    const layer = createAIIntelligenceLayer()
    const pkg = layer.buildPromptPackage({ userContext: { ageGroup: 'child' } })
    expect(pkg.persona.id).toBe('parent-guide')
  })

  it('teacherModeRequested overrides persona selection', () => {
    const layer = createAIIntelligenceLayer()
    const pkg = layer.buildPromptPackage({ userContext: { ageGroup: 'child' }, teacherModeRequested: true })
    expect(pkg.persona.id).toBe('teacher-mode')
  })

  it('formatResponse delegates to the response formatter', () => {
    const layer = createAIIntelligenceLayer()
    const formatted = layer.formatResponse({ content: 'Plain reply.' })
    expect(formatted.blocks).toEqual([{ type: 'plain-text', content: 'Plain reply.' }])
  })

  it('is fully dependency-injected — an overridden engine is actually used', () => {
    const stubPersona = makeMentorPersona({ id: 'teacher-mode', displayName: 'Stub Persona' })
    const selectPersonaSpy = vi.fn(() => stubPersona)
    const stubMentorPersonaEngine: MentorPersonaEngine = {
      selectPersona: selectPersonaSpy,
      getPersonaById: () => stubPersona,
      listPersonas: () => [stubPersona],
    }

    const layer = createAIIntelligenceLayer({ mentorPersonaEngine: stubMentorPersonaEngine })
    const pkg = layer.buildPromptPackage({})

    expect(selectPersonaSpy).toHaveBeenCalledTimes(1)
    expect(pkg.persona).toBe(stubPersona)
  })

  it('is deterministic end-to-end — the same input produces byte-identical PromptPackages', () => {
    const layer = createAIIntelligenceLayer()
    const input = { userContext: { currentLab: 'memory-discovery' }, mindContext: { mindScore: 10 } }
    expect(layer.buildPromptPackage(input)).toEqual(layer.buildPromptPackage(input))
  })
})
