'use client'

import { useEffect } from 'react'

// Static Shell Cache™ registration — see public/sw.js for exactly what it
// does and doesn't cache. Production-only: registering it in `next dev`
// would cache hashed dev-mode chunk URLs that change on every HMR
// rebuild, a well-known footgun where code changes silently stop
// appearing because the old chunk is still being served from cache.
export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Best-effort — a failed registration just means no static-asset
      // caching this session, never a broken app (see sw.js's own doc
      // comment: it never intercepts navigations or API calls).
    })
  }, [])

  return null
}
