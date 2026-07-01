'use client'

import Link from 'next/link'
import React from 'react'
import { Badge } from '@/components/ui/badge'

type Props = {
  id: string
  title: string
  description?: string
}

export function CategoryCard({ id, title, description }: Props): React.JSX.Element {
  return (
    <Link
      href={`/assessments/${id}`}
      className="group block rounded-2xl border bg-card p-6 hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2"
      aria-label={`Open ${title} assessments`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary">Assessments</Badge>
      </div>
      {description && <p className="mt-3 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4 text-xs text-muted-foreground">Browse →</div>
    </Link>
  )
}

export default CategoryCard
