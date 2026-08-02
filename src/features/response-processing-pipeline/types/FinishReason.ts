// The normalized finish-reason vocabulary `FinishReasonResolver`
// resolves raw provider strings into — `'unknown'` covers both a
// genuinely unrecognized raw string and a `null` raw value.
export type FinishReason = 'stop' | 'length' | 'content-filter' | 'error' | 'unknown'
