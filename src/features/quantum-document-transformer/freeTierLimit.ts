// Pro Paywall — the one real number both the client (proactive UI block)
// and the Route Handler (the real enforcement boundary — never trust the
// client alone) compare against, so the two can never silently drift out
// of sync with each other.
export const FREE_TIER_DOCUMENT_LIMIT = 2
