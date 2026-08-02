import type { AdaptiveRuntimeState } from './AdaptiveRuntimeState'
import type { RuntimeEvent } from './RuntimeEvent'
import type { RuntimeActionError } from './RuntimeActionError'

// Adaptive Learning Runtime™ (LSE-2). The one shared result shape every
// runtime decision returns — same Result-type convention as LSE-1's own
// `SessionActionResult`. `events` are the real events THIS call
// produced (not the full accumulated log — see `state.eventLog`).
export type RuntimeActionOptions = {
  now?: () => Date
  idFactory?: () => string
}

export type RuntimeActionResult = { success: true; state: AdaptiveRuntimeState; events: readonly RuntimeEvent[] } | { success: false; error: RuntimeActionError }
