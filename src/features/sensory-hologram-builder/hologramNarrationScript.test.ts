import { describe, expect, it } from 'vitest'
import { HOLOGRAM_GOALS, getHologramGoalById } from './hologramDatabase'
import { HOLOGRAM_PHASE_IDS, applyBreathingPauses, buildNarrationPhases, countTotalNarrationLines } from './hologramNarrationScript'

describe('buildNarrationPhases', () => {
  it('produces exactly the 5 spec-named phases, in order', () => {
    const goal = getHologramGoalById('crisp-apple')!
    const phases = buildNarrationPhases(goal)
    expect(phases.map((phase) => phase.id)).toEqual(['grounding', 'sight', 'touch', 'taste-smell', 'synthesis'])
    expect(phases.map((phase) => phase.id)).toEqual(HOLOGRAM_PHASE_IDS)
  })

  it('every phase has real, non-empty bilingual lines', () => {
    const goal = getHologramGoalById('dream-home')!
    const phases = buildNarrationPhases(goal)
    for (const phase of phases) {
      expect(phase.lines.length).toBeGreaterThan(0)
      for (const line of phase.lines) {
        expect(line.en.trim().length).toBeGreaterThan(0)
        expect(line.hi.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it("splices the goal's own sensory lines (with breathing pauses applied) into the correct phases", () => {
    const goal = getHologramGoalById('ocean-waves')!
    const phases = buildNarrationPhases(goal)
    const sightPhase = phases.find((phase) => phase.id === 'sight')!
    const touchPhase = phases.find((phase) => phase.id === 'touch')!
    const tasteSmellPhase = phases.find((phase) => phase.id === 'taste-smell')!
    const synthesisPhase = phases.find((phase) => phase.id === 'synthesis')!

    expect(sightPhase.lines.some((line) => line.en === applyBreathingPauses(goal.sight.en))).toBe(true)
    expect(touchPhase.lines.some((line) => line.en === applyBreathingPauses(goal.touch.en))).toBe(true)
    expect(tasteSmellPhase.lines.some((line) => line.en === applyBreathingPauses(goal.tasteSmell.en))).toBe(true)
    expect(synthesisPhase.lines.some((line) => line.en === applyBreathingPauses(goal.affirmation.en))).toBe(true)
  })

  it("mentions the goal's own title in the sight and synthesis framing lines", () => {
    const goal = getHologramGoalById('luxury-car')!
    const phases = buildNarrationPhases(goal)
    const sightIntro = phases.find((phase) => phase.id === 'sight')!.lines[0]!
    const synthesisIntro = phases.find((phase) => phase.id === 'synthesis')!.lines[0]!
    expect(sightIntro.en.toLowerCase()).toContain('luxury car')
    expect(sightIntro.hi).toContain(goal.titleHi)
    expect(synthesisIntro.en.toLowerCase()).toContain('luxury car')
    expect(synthesisIntro.hi).toContain(goal.titleHi)
  })

  it('the grounding phase is identical regardless of which goal is chosen (shared framing, not goal-specific)', () => {
    const phasesA = buildNarrationPhases(getHologramGoalById('crisp-apple')!)
    const phasesB = buildNarrationPhases(getHologramGoalById('dream-home')!)
    const groundingA = phasesA.find((phase) => phase.id === 'grounding')!.lines
    const groundingB = phasesB.find((phase) => phase.id === 'grounding')!.lines
    expect(groundingA).toEqual(groundingB)
  })

  it('produces a genuinely different script per goal (not a fixed template ignoring the goal)', () => {
    const phasesA = buildNarrationPhases(getHologramGoalById('crisp-apple')!)
    const phasesB = buildNarrationPhases(getHologramGoalById('dream-home')!)
    expect(phasesA).not.toEqual(phasesB)
  })

  it('builds a valid script for every single goal in the database (no crashes, no missing lines)', () => {
    for (const goal of HOLOGRAM_GOALS) {
      const phases = buildNarrationPhases(goal)
      expect(phases).toHaveLength(5)
      expect(countTotalNarrationLines(phases)).toBeGreaterThanOrEqual(15)
    }
  })
})

describe('countTotalNarrationLines', () => {
  it('sums line counts across all phases', () => {
    const phases = buildNarrationPhases(getHologramGoalById('crisp-apple')!)
    const manualSum = phases.reduce((sum, phase) => sum + phase.lines.length, 0)
    expect(countTotalNarrationLines(phases)).toBe(manualSum)
  })
})

describe('applyBreathingPauses', () => {
  it('inserts an ellipsis breathing pause after every comma clause', () => {
    expect(applyBreathingPauses('You see the light, the water, the sky.')).toBe('You see the light, ... the water, ... the sky.')
  })

  it('leaves text with no commas completely untouched', () => {
    const text = 'You are safe here.'
    expect(applyBreathingPauses(text)).toBe(text)
  })

  it('is idempotent — running it twice never produces a doubled ellipsis', () => {
    const once = applyBreathingPauses('A calm mind, a steady breath.')
    const twice = applyBreathingPauses(once)
    expect(twice).toBe(once)
    expect(twice).not.toContain('......')
  })

  it('applies equally to Hindi text using the same ASCII comma', () => {
    expect(applyBreathingPauses('अपने शरीर को शिथिल होने दें, और अपने मन को शांत होने दें।')).toBe(
      'अपने शरीर को शिथिल होने दें, ... और अपने मन को शांत होने दें।',
    )
  })

  it('never disturbs an ellipsis that already exists in the source text', () => {
    const withExistingEllipsis = applyBreathingPauses('Take a slow, deep breath in... and let it go.')
    expect(withExistingEllipsis).toBe('Take a slow, ... deep breath in... and let it go.')
    expect(withExistingEllipsis).not.toContain('......')
  })
})

describe('buildNarrationPhases — breathing pauses baked into every generated line', () => {
  it('every comma-bearing generated line actually contains an injected pause', () => {
    const phases = buildNarrationPhases(getHologramGoalById('luxury-car')!)
    const allLines = phases.flatMap((phase) => phase.lines)
    const commaLines = allLines.filter((line) => line.en.includes(','))
    expect(commaLines.length).toBeGreaterThan(0)
    for (const line of commaLines) {
      expect(line.en).toContain('...')
    }
  })
})
