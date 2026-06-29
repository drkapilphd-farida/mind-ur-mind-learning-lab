'use client'

import { useEffect, useState } from 'react'

type GreetingHeadingProps = {
  studentName: string
}

function getTimeOfDayGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Time-of-day greeting depends on the student's local clock, which the
// server can't know — rendering it client-side after mount (with a neutral
// server-safe fallback) avoids guessing the wrong time of day from server
// time, at the cost of a one-frame upgrade after hydration.
export function GreetingHeading({ studentName }: GreetingHeadingProps): React.JSX.Element {
  const [greeting, setGreeting] = useState<string | null>(null)

  useEffect(() => {
    setGreeting(getTimeOfDayGreeting(new Date().getHours()))
  }, [])

  return (
    <h1 className="text-2xl font-semibold tracking-tight">
      {greeting ?? 'Welcome back'}, {studentName}
    </h1>
  )
}
