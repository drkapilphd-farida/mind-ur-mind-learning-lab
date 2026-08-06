'use client'

import { RouteErrorFallback } from '@/features/errors/components/RouteErrorFallback'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

// The one boundary error.tsx can't cover: a failure in the root layout
// itself (src/app/layout.tsx — fonts, Providers, Toaster). Next.js
// requires global-error.tsx to render its own <html>/<body>, since it
// replaces the entire root layout when it activates, not just the
// content below it.
export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <RouteErrorFallback error={error} reset={reset} context="Global (root layout) error" message="An unexpected error occurred. Please try again." fullScreen />
      </body>
    </html>
  )
}
