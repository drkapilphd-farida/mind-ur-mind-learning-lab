import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Complete(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="space-y-6">
        <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12l4 4L19 6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">Assessment Completed</h1>
        <p className="text-muted-foreground">Preparing your personalized analysis... Your Transformation Dashboard will be available in the next module.</p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
        <Button>Finish</Button>
      </div>
    </main>
  )
}
