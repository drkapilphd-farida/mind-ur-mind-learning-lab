'use client'

import { Clock } from 'lucide-react'

type ReadingObjectiveCardProps = {
  objectiveText: string
  estimatedTime: string | null
}

export function ReadingObjectiveCard({ objectiveText, estimatedTime }: ReadingObjectiveCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card px-4 py-3">
      <p className="text-sm text-foreground">{objectiveText}</p>
      {estimatedTime !== null && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" aria-hidden="true" />
          {estimatedTime}
        </p>
      )}
    </div>
  )
}
