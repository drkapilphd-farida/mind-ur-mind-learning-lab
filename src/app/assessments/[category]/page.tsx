import React from 'react'
import Link from 'next/link'
import { AssessmentCard } from '@/components/assessment/AssessmentCard'
import { notFound } from 'next/navigation'
import type { Category } from '@/features/assessments/types'

const mockData: Record<string, Category> = {
  'mental-wellness': {
    id: 'mental-wellness',
    title: 'Mental Wellness',
    assessments: [
      { id: 'overthinking', title: 'Overthinking Assessment™', durationMinutes: 5, questionsCount: 10 },
      { id: 'stress', title: 'Stress Assessment™', durationMinutes: 5, questionsCount: 10 },
    ],
  },
  'cognitive-intelligence': {
    id: 'cognitive-intelligence',
    title: 'Cognitive Intelligence',
    assessments: [
      { id: 'reading-speed', title: 'Reading Speed Assessment™', durationMinutes: 5, questionsCount: 12 },
    ],
  },
  'complete': {
    id: 'complete',
    title: 'Complete Mind Assessment™',
    assessments: [{ id: 'complete-10', title: 'Complete Mind Assessment™', durationMinutes: 10, questionsCount: 50 }],
  },
}

type Props = { params: Promise<{ category: string }> }

export default async function CategoryPage({ params }: Props): Promise<React.JSX.Element> {
  const { category } = await params
  const data = mockData[category]
  if (!data) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{data.title}</h1>
        <p className="text-muted-foreground">Select an assessment to begin.</p>
      </div>

      <div className="mt-6 space-y-3">
        {data.assessments.map((a) => (
          <AssessmentCard key={a.id} id={a.id} categoryId={data.id} title={a.title} duration={`${a.durationMinutes} min`} questions={a.questionsCount} />
        ))}
      </div>

      <div className="mt-8">
        <Link href="/assessments" className="text-sm text-muted-foreground">← Back to Assessment Center</Link>
      </div>
    </main>
  )
}
