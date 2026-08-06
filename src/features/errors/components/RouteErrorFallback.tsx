'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { reportClientError } from '@/lib/reportClientError'
import { Button } from '@/components/ui/button'

type RouteErrorFallbackProps = {
  error: Error & { digest?: string }
  reset: () => void
  // Identifies which boundary caught this in the server-side log (e.g.
  // "Admin route error") — the same strings each error.tsx used to pass
  // to logger.error() directly before this component centralized it.
  context: string
  message: string
  // Root error.tsx renders with nothing else on the page (no nav/sidebar
  // shell around it, since the failure could be in the shell itself),
  // so it gets a full-viewport layout; every route-group boundary below
  // renders inside its own already-visible shell.
  fullScreen?: boolean
}

// Shared by every error.tsx (and global-error.tsx) in the app — one
// place that both renders the fallback UI and reports the error back to
// the server via reportClientError, so no boundary can silently regress
// to "only logs to the crashed user's own browser console."
export function RouteErrorFallback({ error, reset, context, message, fullScreen = false }: RouteErrorFallbackProps): React.JSX.Element {
  useEffect(() => {
    reportClientError(context, error)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- report once per distinct error, not on every render
  }, [error])

  return (
    <div className={fullScreen ? 'flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center' : 'flex flex-col items-center justify-center py-20 text-center'}>
      <AlertTriangle className="text-muted-foreground/40 mb-4 size-10" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mt-2 max-w-xs text-sm">{message}</p>
      {error.digest !== undefined && <p className="text-muted-foreground/70 mt-1 text-xs">Error ID: {error.digest}</p>}
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  )
}
