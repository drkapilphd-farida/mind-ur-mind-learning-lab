'use client'

import React from 'react'
import { QuestionCard } from '@/components/assessment/QuestionCard'
import { useRouter } from 'next/navigation'

export default function QuestionsPage(): React.JSX.Element {
  const router = useRouter()

  function handleFinish(): void {
    // Placeholder for completion flow — navigate to completion screen
    router.push('./complete')
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Question 1 of 50</h1>
        <div className="mt-2 text-sm text-muted-foreground">Progress indicator placeholder</div>
      </div>

      <div className="mt-6">
        <QuestionCard question="I find it easy to focus on reading for 20 minutes." options={[{ id: 'a', label: 'Strongly agree' }, { id: 'b', label: 'Agree' }, { id: 'c', label: 'Neutral' }, { id: 'd', label: 'Disagree' }]} />
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={handleFinish} className="rounded-lg bg-primary px-4 py-2 text-white">Finish</button>
      </div>
    </main>
  )
}
