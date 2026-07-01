'use client'

import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  id: string
  categoryId: string
  title: string
  duration?: string
  questions?: number | undefined
}

export function AssessmentCard({ id, categoryId, title, duration, questions }: Props): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{duration ?? 'Short'} • {questions ?? '—'} questions</p>
        </div>
        <div className="shrink-0">
          <Link href={`/assessments/${categoryId}/${id}`}> 
            <Button variant="default">Start</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AssessmentCard
