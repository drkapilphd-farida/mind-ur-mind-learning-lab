import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import type { Assessment } from '@/features/assessments/types'

const mockAssessments: Record<string, Assessment> = {
  'complete-10': { id: 'complete-10', title: 'Complete Mind Assessment™', durationMinutes: 10, questionsCount: 50, description: 'A complete evaluation of your current mental performance.' },
  'reading-speed': { id: 'reading-speed', title: 'Reading Speed Assessment™', durationMinutes: 5, questionsCount: 12, description: 'Measure your reading speed.' },
}

type Props = { params: Promise<{ category: string; assessment: string }> }

export default async function AssessmentDetail({ params }: Props): Promise<React.JSX.Element> {
  const { category, assessment } = await params
  const data = mockAssessments[assessment]
  if (!data) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <p className="text-muted-foreground">{data.description}</p>
        <div className="flex items-center gap-4">
          <div className="text-sm">Duration: {data.durationMinutes} minutes</div>
          <div className="text-sm">Approximately {data.questionsCount} questions</div>
        </div>
      </div>

      <div className="mt-8">
        <Link href={`./welcome`}>
          <Button>Start Assessment</Button>
        </Link>
        <Link href={`/assessments/${category}`} className="ml-4">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    </main>
  )
}
