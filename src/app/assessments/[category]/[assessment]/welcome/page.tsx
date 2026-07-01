import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = { params: Promise<{ category: string; assessment: string }> }

export default async function Welcome({ params }: Props): Promise<React.JSX.Element> {
  const { category } = await params

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">Welcome to Mind Assessment Center™</h1>
      <p className="mt-4 text-muted-foreground">In the next few minutes, you&apos;ll discover how your mind works today. There are no right or wrong answers. Answer honestly.</p>

      <div className="mt-6 flex justify-center gap-4">
        <div className="text-sm text-muted-foreground">Estimated time: ~10 minutes</div>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link href={`./questions`}>
          <Button size="lg">Start</Button>
        </Link>
        <Link href={`/assessments/${category}`}>
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    </main>
  )
}
