import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Practice',
}

export default function PracticePage(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Zap className="text-muted-foreground/30 mb-4 size-10" />
      <h1 className="text-xl font-semibold">Practice Mode</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        AI-powered practice exercises and quizzes are coming soon. Keep
        learning in the meantime.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}
