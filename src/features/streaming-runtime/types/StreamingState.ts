// "## Streaming States" (§ brief), verbatim — 7 values. First state machine in the
// Real AI Integration™ arc with a `paused` state (see `../stateMachine` for the
// transition table and the note on why `paused` is reachable only via direct
// state-machine tests, not through `DefaultStreamingLifecycleManager.run()`).
export type StreamingState =
  | 'idle'
  | 'starting'
  | 'streaming'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed'
