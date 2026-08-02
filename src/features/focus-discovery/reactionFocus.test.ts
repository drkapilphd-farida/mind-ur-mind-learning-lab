import { describe, expect, it } from 'vitest'
import { generateReactionFocusTrials, pickReactionFocusTarget } from './reactionFocus'
import {
  REACTION_FOCUS_HARD_MAX_DELAY_MS,
  REACTION_FOCUS_MAX_DECOYS_PER_TRIAL,
  REACTION_FOCUS_MAX_DELAY_MS,
  REACTION_FOCUS_MIN_DELAY_MS,
  REACTION_FOCUS_SECOND_DECOY_FROM_TRIAL,
  REACTION_FOCUS_TIME_PRESSURE_FROM_TRIAL,
  REACTION_FOCUS_TRIAL_COUNT,
} from './focusTimingConfig'

describe('generateReactionFocusTrials', () => {
  it('FIX-04 — produces the real fixed number of real trials', () => {
    const target = pickReactionFocusTarget(1)
    const trials = generateReactionFocusTrials(target, 2)
    expect(trials.length).toBe(REACTION_FOCUS_TRIAL_COUNT)
  })

  it('FIX-04 — every real delay (final wait and every real decoy gap) stays within the real randomized window', () => {
    const target = pickReactionFocusTarget(3)
    const trials = generateReactionFocusTrials(target, 4)
    for (const trial of trials) {
      expect(trial.delayMs).toBeGreaterThanOrEqual(REACTION_FOCUS_MIN_DELAY_MS)
      expect(trial.delayMs).toBeLessThanOrEqual(REACTION_FOCUS_MAX_DELAY_MS)
      for (const decoy of trial.decoys) {
        expect(decoy.gapBeforeMs).toBeGreaterThanOrEqual(REACTION_FOCUS_MIN_DELAY_MS)
        expect(decoy.gapBeforeMs).toBeLessThanOrEqual(REACTION_FOCUS_MAX_DELAY_MS)
      }
    }
  })

  it('Sprint-1.5 FIX-09 — a real trial\'s own decoy chain never exceeds the real configured maximum', () => {
    for (let seed = 0; seed < 30; seed++) {
      const target = pickReactionFocusTarget(seed)
      const trials = generateReactionFocusTrials(target, seed + 100)
      for (const trial of trials) expect(trial.decoys.length).toBeLessThanOrEqual(REACTION_FOCUS_MAX_DECOYS_PER_TRIAL)
    }
  })

  it('a real decoy never accidentally duplicates the real target', () => {
    for (let seed = 0; seed < 30; seed++) {
      const target = pickReactionFocusTarget(seed)
      const trials = generateReactionFocusTrials(target, seed + 100)
      for (const trial of trials) {
        for (const decoy of trial.decoys) {
          expect(decoy.shape === target.shape && decoy.color === target.color).toBe(false)
        }
      }
    }
  })

  it('Sprint-1.5 FIX-09 — real decoy counts vary (never a fixed "one decoy or none" shape)', () => {
    const uniqueDecoyCounts = new Set<number>()
    for (let seed = 0; seed < 15; seed++) {
      const target = pickReactionFocusTarget(seed)
      const trials = generateReactionFocusTrials(target, seed + 10)
      for (const trial of trials) uniqueDecoyCounts.add(trial.decoys.length)
    }
    expect(uniqueDecoyCounts.size).toBeGreaterThan(1)
  })

  it('real delays vary across trials (never a fixed metronome)', () => {
    const target = pickReactionFocusTarget(5)
    const trials = generateReactionFocusTrials(target, 6)
    const uniqueDelays = new Set(trials.map((trial) => trial.delayMs))
    expect(uniqueDelays.size).toBeGreaterThan(1)
  })

  it('Sprint-1.7 RULE-01/02 — a real second decoy never appears before the real progressive threshold trial', () => {
    for (let seed = 0; seed < 30; seed++) {
      const target = pickReactionFocusTarget(seed)
      const trials = generateReactionFocusTrials(target, seed + 200)
      for (let trialIndex = 0; trialIndex < REACTION_FOCUS_SECOND_DECOY_FROM_TRIAL; trialIndex++) {
        expect(trials[trialIndex]!.decoys.length).toBeLessThanOrEqual(1)
      }
    }
  })

  it('Sprint-1.7 RULE-01/02 — real "time pressure" only tightens the real delay ceiling from its own threshold trial on', () => {
    for (let seed = 0; seed < 30; seed++) {
      const target = pickReactionFocusTarget(seed)
      const trials = generateReactionFocusTrials(target, seed + 300)
      for (let trialIndex = REACTION_FOCUS_TIME_PRESSURE_FROM_TRIAL; trialIndex < REACTION_FOCUS_TRIAL_COUNT; trialIndex++) {
        expect(trials[trialIndex]!.delayMs).toBeLessThanOrEqual(REACTION_FOCUS_HARD_MAX_DELAY_MS)
      }
    }
  })
})
