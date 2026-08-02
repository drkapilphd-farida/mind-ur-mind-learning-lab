import { describe, expect, it } from 'vitest'
import { transitionPipelineStage } from './transitionPipelineStage'
import { IllegalPipelineTransitionError } from './IllegalPipelineTransitionError'
import { PIPELINE_STAGE_ORDER } from './PIPELINE_STAGE_ORDER'

describe('transitionPipelineStage', () => {
  it('allows each success-path transition in order', () => {
    for (let index = 0; index < PIPELINE_STAGE_ORDER.length - 1; index += 1) {
      const from = PIPELINE_STAGE_ORDER[index]!
      const to = PIPELINE_STAGE_ORDER[index + 1]!
      expect(transitionPipelineStage(from, to)).toBe(to)
    }
  })

  it('allows a transition from any non-terminal stage to failed', () => {
    expect(transitionPipelineStage('initialized', 'failed')).toBe('failed')
    expect(transitionPipelineStage('response-normalized', 'failed')).toBe('failed')
  })

  it('throws IllegalPipelineTransitionError for a skipped stage', () => {
    expect(() => transitionPipelineStage('initialized', 'prompt-ready')).toThrow(IllegalPipelineTransitionError)
  })

  it('throws IllegalPipelineTransitionError for any transition out of a terminal state', () => {
    expect(() => transitionPipelineStage('completed', 'context-ready')).toThrow(IllegalPipelineTransitionError)
    expect(() => transitionPipelineStage('failed', 'initialized')).toThrow(IllegalPipelineTransitionError)
  })
})
