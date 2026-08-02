'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps): React.JSX.Element {
  useEffect(() => {
    logger.error('AI Learning Studio route error', { message: error.message, digest: error.digest })
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="mb-4 size-10 text-muted-foreground/40" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        An unexpected error occurred. Your progress has been saved.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  )
}
