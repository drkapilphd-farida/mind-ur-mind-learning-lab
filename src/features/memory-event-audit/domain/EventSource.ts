// The subsystem that produced an event (e.g. `"memory-persistence"`,
// `"memory-session-context"`) — a plain, caller-supplied string, never
// an imported enum from another feature.
export type EventSource = string
