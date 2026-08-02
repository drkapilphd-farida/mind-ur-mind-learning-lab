// The deterministic, caller-supplied signal for one attempt — "No
// timers. No waiting. Only decision logic": this engine never measures
// or produces a real outcome, it only reacts to one given per attempt,
// simulating what a real provider call would eventually report.
export type ExecutionAttemptOutcome = 'success' | 'failure' | 'timeout'
