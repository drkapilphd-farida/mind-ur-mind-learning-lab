import { describe, expect, it } from 'vitest'
import { createMentorPersonaEngine } from './DefaultMentorPersonaEngine'
import { MENTOR_PERSONAS } from './MENTOR_PERSONAS'

describe('DefaultMentorPersonaEngine', () => {
  const engine = createMentorPersonaEngine()

  it('lists all 6 personas', () => {
    expect(engine.listPersonas()).toHaveLength(6)
    expect(engine.listPersonas().map((persona) => persona.id).sort()).toEqual(
      ['focus-coach', 'friendly-mentor', 'memory-coach', 'parent-guide', 'reading-coach', 'teacher-mode'].sort(),
    )
  })

  it('getPersonaById returns the matching persona', () => {
    expect(engine.getPersonaById('teacher-mode')?.displayName).toBe('Teacher Mode™')
  })

  it('getPersonaById returns undefined for an unknown id', () => {
    expect(engine.getPersonaById('does-not-exist')).toBeUndefined()
  })

  it('teacherModeRequested always wins, regardless of ageGroup or lab', () => {
    const persona = engine.selectPersona({ currentLab: 'quantum-speed-reading', ageGroup: 'child', teacherModeRequested: true })
    expect(persona.id).toBe('teacher-mode')
  })

  it('a child learner routes to Parent Guide™ when teacher mode is not requested', () => {
    const persona = engine.selectPersona({ currentLab: null, ageGroup: 'child', teacherModeRequested: false })
    expect(persona.id).toBe('parent-guide')
  })

  it('an adult in the reading lab routes to Reading Coach™', () => {
    const persona = engine.selectPersona({ currentLab: 'quantum-speed-reading', ageGroup: 'adult', teacherModeRequested: false })
    expect(persona.id).toBe('reading-coach')
  })

  it('an adult in the memory lab routes to Memory Coach™', () => {
    const persona = engine.selectPersona({ currentLab: 'memory-discovery', ageGroup: 'adult', teacherModeRequested: false })
    expect(persona.id).toBe('memory-coach')
  })

  it('an adult in the focus lab routes to Focus Coach™', () => {
    const persona = engine.selectPersona({ currentLab: 'focus-discovery', ageGroup: 'adult', teacherModeRequested: false })
    expect(persona.id).toBe('focus-coach')
  })

  it('falls back to Friendly Mentor™ for an unrecognized lab', () => {
    const persona = engine.selectPersona({ currentLab: 'some-unrelated-lab', ageGroup: 'adult', teacherModeRequested: false })
    expect(persona.id).toBe('friendly-mentor')
  })

  it('falls back to Friendly Mentor™ when currentLab is null', () => {
    const persona = engine.selectPersona({ currentLab: null, ageGroup: 'teen', teacherModeRequested: false })
    expect(persona.id).toBe('friendly-mentor')
  })

  it('selection is deterministic — the same input always yields the same persona', () => {
    const input = { currentLab: 'quantum-speed-reading', ageGroup: 'adult' as const, teacherModeRequested: false }
    expect(engine.selectPersona(input)).toEqual(engine.selectPersona(input))
  })

  it('every persona in the catalog has a non-empty systemPromptFragment', () => {
    for (const persona of MENTOR_PERSONAS) {
      expect(persona.systemPromptFragment.length).toBeGreaterThan(0)
    }
  })
})
