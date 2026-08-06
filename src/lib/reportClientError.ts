'use client'

// The client half of /api/log-client-error. Every error.tsx/global-error.tsx
// boundary in this app previously called the shared `logger` directly —
// which, called from client code, only ever reaches that one user's own
// browser console (console.error is a real browser API, but nobody
// operating the platform is looking at a stranger's devtools). This is
// the actual fix: forward the error to the server, where the same
// `logger` module writes it somewhere an operator can actually see it.
//
// Fire-and-forget by design — reporting an error must never itself throw
// or block the fallback UI from rendering. `keepalive` lets the request
// outlive a page unload triggered by the user immediately navigating
// away from the error screen.
export function reportClientError(context: string, error: Error & { digest?: string }): void {
  if (typeof window === 'undefined') return

  // Still worth the local devtools trail during development; production
  // visibility is the POST below, not this line.
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, error)

  void fetch('/api/log-client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      context,
      message: error.message,
      digest: error.digest,
      url: window.location.href,
    }),
  }).catch(() => {
    // Reporting failed to report — nothing further to do; the fallback
    // UI must render regardless.
  })
}
