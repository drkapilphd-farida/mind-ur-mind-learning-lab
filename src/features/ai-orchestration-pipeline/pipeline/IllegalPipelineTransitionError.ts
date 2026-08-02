import type { PipelineStage } from '../types'

// Thrown when a transition doesn't exist in the legal transition graph
// (e.g. `completed` -> `context-ready`) — a genuine domain failure,
// never silently applied.
export class IllegalPipelineTransitionError extends Error {
  constructor(from: PipelineStage, to: PipelineStage) {
    super(`Illegal pipeline stage transition: "${from}" -> "${to}"`)
    this.name = 'IllegalPipelineTransitionError'
  }
}
