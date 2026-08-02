import type { SessionState } from '../types'

export class IllegalSessionTransitionError extends Error {
  constructor(
    public readonly from: SessionState,
    public readonly to: SessionState,
  ) {
    super(`Illegal session state transition: "${from}" -> "${to}"`)
    this.name = 'IllegalSessionTransitionError'
  }
}
