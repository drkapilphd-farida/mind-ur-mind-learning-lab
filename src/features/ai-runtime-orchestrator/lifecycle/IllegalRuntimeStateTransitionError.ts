import type { RuntimeState } from '../types'

export class IllegalRuntimeStateTransitionError extends Error {
  constructor(
    public readonly from: RuntimeState,
    public readonly to: RuntimeState,
  ) {
    super(`Illegal runtime state transition: "${from}" -> "${to}"`)
    this.name = 'IllegalRuntimeStateTransitionError'
  }
}
