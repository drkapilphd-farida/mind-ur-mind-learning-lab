import { describe, expect, it } from 'vitest'
import { COGNITIVE_FLEXIBILITY_ROUND_COUNT, generateCognitiveFlexibilityRound, matchesRule, type CognitiveFlexibilityRound, type CognitiveFlexibilityRule } from './cognitiveFlexibility'
import { COGNITIVE_FLEXIBILITY_ROUND_OBJECT_COUNTS } from './focusTimingConfig'

// Mirrors exactly how `CognitiveFlexibilityCard` itself drives the real
// lazy, one-round-at-a-time API: each real round's own rule is threaded
// into the next real call, real round number always advances 0→4, and
// (by default) the real content difficulty level advances in lockstep —
// the same real "no adaptive stabilization" case the fixed Sprint-1.7
// ladder always produced.
function generateSequence(
  seed: number,
  prefersReducedMotion: boolean,
  levels: readonly number[] = [0, 1, 2, 3, 4],
): readonly CognitiveFlexibilityRound[] {
  const rounds: CognitiveFlexibilityRound[] = []
  let previousRule: CognitiveFlexibilityRule | null = null
  for (let roundNumber = 0; roundNumber < levels.length; roundNumber++) {
    const round = generateCognitiveFlexibilityRound(levels[roundNumber]!, roundNumber, previousRule, seed, prefersReducedMotion)
    rounds.push(round)
    previousRule = round.rule
  }
  return rounds
}

describe('generateCognitiveFlexibilityRound', () => {
  it('FIX-06 — a real full session produces the real fixed number of real rounds', () => {
    const rounds = generateSequence(1, false)
    expect(rounds.length).toBe(COGNITIVE_FLEXIBILITY_ROUND_COUNT)
  })

  it('"the user must adapt quickly" — no two consecutive real rounds ever share the same real rule', () => {
    for (let seed = 0; seed < 20; seed++) {
      const rounds = generateSequence(seed, false)
      for (let i = 1; i < rounds.length; i++) {
        expect(rounds[i]!.rule).not.toEqual(rounds[i - 1]!.rule)
      }
    }
  })

  it('every real round always has at least one genuine real match for its own rule', () => {
    for (let seed = 0; seed < 20; seed++) {
      const rounds = generateSequence(seed, false)
      for (const round of rounds) {
        expect(round.targetIds.length).toBeGreaterThan(0)
        for (const id of round.targetIds) {
          const object = round.objects.find((candidate) => candidate.id === id)!
          expect(matchesRule(object, round.rule, round.movingIds)).toBe(true)
        }
      }
    }
  })

  it('a real reduced-motion session never uses the motion rule (real accessibility fallback)', () => {
    for (let seed = 0; seed < 20; seed++) {
      const rounds = generateSequence(seed, true)
      expect(rounds.some((round) => round.rule.kind === 'motion')).toBe(false)
    }
  })

  it('is deterministic for the same real seed, real round number, real previous rule, and real motion preference', () => {
    expect(generateCognitiveFlexibilityRound(2, 3, { kind: 'shape', value: 'circle' }, 8, false)).toEqual(
      generateCognitiveFlexibilityRound(2, 3, { kind: 'shape', value: 'circle' }, 8, false),
    )
  })

  it('Sprint-1.5 FIX-06 — no two consecutive real rounds ever share the same real rule KIND', () => {
    for (let seed = 0; seed < 20; seed++) {
      const rounds = generateSequence(seed, false)
      for (let i = 1; i < rounds.length; i++) {
        expect(rounds[i]!.rule.kind).not.toBe(rounds[i - 1]!.rule.kind)
      }
    }
  })

  it('Sprint-1.5 FIX-06/FIX-09 — the real rule-kind order is not fixed across real sessions', () => {
    // Real session seeds come from `Date.now()` — widely-spaced, not
    // small sequential integers (a single-step LCG applied to tiny
    // consecutive inputs barely moves the output; real seeds don't
    // share that weakness). Mirrors real seed spacing here.
    const orders = new Set<string>()
    for (let seed = 0; seed < 15; seed++) {
      orders.add(
        generateSequence(seed * 7919 + 1000003, false)
          .map((round) => round.rule.kind)
          .join(','),
      )
    }
    expect(orders.size).toBeGreaterThan(1)
  })

  it('Sprint-1.5 FIX-06 — a real "exclude-color" round marks every non-excluded real object as a real target', () => {
    let foundExcludeRound = false
    for (let seed = 0; seed < 30; seed++) {
      const rounds = generateSequence(seed, false)
      for (const round of rounds) {
        if (round.rule.kind !== 'exclude-color') continue
        foundExcludeRound = true
        for (const object of round.objects) {
          expect(round.targetIds.includes(object.id)).toBe(object.color !== round.rule.value)
        }
      }
    }
    expect(foundExcludeRound).toBe(true)
  })

  it('Sprint-1.7 RULE-01/02 — real object count rises with the real content difficulty LEVEL', () => {
    let previousRule: CognitiveFlexibilityRule | null = null
    for (let levelIndex = 0; levelIndex < COGNITIVE_FLEXIBILITY_ROUND_COUNT; levelIndex++) {
      const round = generateCognitiveFlexibilityRound(levelIndex, levelIndex, previousRule, 42, false)
      expect(round.objects.length).toBe(COGNITIVE_FLEXIBILITY_ROUND_OBJECT_COUNTS[levelIndex])
      previousRule = round.rule
    }
  })

  it('Sprint-1.8 — a stabilized real session (level never advances) still produces real, valid, fresh rounds', () => {
    // The real round NUMBER still advances every round (real rule-kind
    // freshness never stalls) even when the real content difficulty
    // level holds at Level 1 the whole real mission.
    const rounds = generateSequence(11, false, [0, 0, 0, 0, 0])
    expect(rounds.length).toBe(COGNITIVE_FLEXIBILITY_ROUND_COUNT)
    for (const round of rounds) {
      expect(round.objects.length).toBe(COGNITIVE_FLEXIBILITY_ROUND_OBJECT_COUNTS[0])
      expect(round.targetIds.length).toBeGreaterThan(0)
    }
    for (let i = 1; i < rounds.length; i++) expect(rounds[i]!.rule.kind).not.toBe(rounds[i - 1]!.rule.kind)
  })
})
