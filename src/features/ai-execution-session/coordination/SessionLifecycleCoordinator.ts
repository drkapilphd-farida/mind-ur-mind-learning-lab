import type { SessionRunInputs, SessionRunResult } from '../types'

// One of the brief's own 10 named responsibilities — the single entry
// point driving one session through its entire lifecycle: "Session
// creation, Session initialization, Runtime context binding, Request
// execution tracking, Response completion tracking, Session state
// transitions, Success completion, Failure completion, Diagnostics,
// Final session result." Never throws.
export interface SessionLifecycleCoordinator {
  run(inputs: SessionRunInputs): SessionRunResult
}
