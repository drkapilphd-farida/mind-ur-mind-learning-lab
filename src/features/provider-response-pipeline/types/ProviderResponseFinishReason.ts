// The unified finish-reason vocabulary every provider profile's own
// raw vocabulary is deterministically mapped into (§3 "Finish
// reason") — table lookup, never generated text. See
// `../translation/normalizeOpenAIResponse.ts` and its siblings for the
// per-provider mapping tables.
export type ProviderResponseFinishReason = 'stop' | 'length' | 'safety' | 'unknown'
