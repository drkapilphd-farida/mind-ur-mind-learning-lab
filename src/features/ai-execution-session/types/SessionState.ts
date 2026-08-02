// "## Session States" (§ brief), verbatim, kebab-cased per this arc's
// own convention.
export type SessionState = 'created' | 'initialized' | 'running' | 'waiting-for-response' | 'completed' | 'failed' | 'cancelled'
