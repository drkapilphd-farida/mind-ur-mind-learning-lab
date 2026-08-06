'use client'

import { RouteErrorFallback } from '@/features/errors/components/RouteErrorFallback'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps): React.JSX.Element {
  return <RouteErrorFallback error={error} reset={reset} context="Admin route error" message="An unexpected error occurred in the admin panel." />
}
