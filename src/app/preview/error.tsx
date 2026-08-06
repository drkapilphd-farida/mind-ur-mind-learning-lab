'use client'

import { RouteErrorFallback } from '@/features/errors/components/RouteErrorFallback'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps): React.JSX.Element {
  return <RouteErrorFallback error={error} reset={reset} context="AI Learning Studio route error" message="An unexpected error occurred. Your progress has been saved." />
}
