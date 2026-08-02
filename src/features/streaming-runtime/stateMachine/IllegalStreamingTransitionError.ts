import type { StreamingState } from '../types'

export class IllegalStreamingTransitionError extends Error {
  constructor(
    public readonly from: StreamingState,
    public readonly to: StreamingState,
  ) {
    super(`Illegal streaming state transition: "${from}" -> "${to}"`)
    this.name = 'IllegalStreamingTransitionError'
  }
}
