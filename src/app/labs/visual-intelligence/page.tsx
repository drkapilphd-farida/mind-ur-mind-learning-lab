import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getModuleProgress } from '@/lib/exercises/queries/getModuleProgress'
import { VISUAL_ACTIVATION_EXERCISE_IDS } from '@/features/visual-intelligence/visualActivationSequence'

export const metadata: Metadata = {
  title: 'Visual Activation™ — Visual Intelligence Lab™',
  description: 'Activate your visual system before high-speed reading.',
}

export default async function VisualIntelligenceLabPage(): Promise<React.JSX.Element> {
  const progress = await getModuleProgress('visual-intelligence', VISUAL_ACTIVATION_EXERCISE_IDS)
  const isComplete = progress.totalCount > 0 && progress.completedCount === progress.totalCount

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Intelligence Journey</p>
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Visual Intelligence Lab™</h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-foreground/80">
        Activate your visual system before beginning high-speed reading — one guided journey through breathing, eye relaxation, and steady-gaze training.
      </p>

      <Card className="mt-10 transition-shadow duration-200 hover:shadow-md">
        <CardContent className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
              isComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {isComplete ? <Check className="size-4" /> : 1}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-medium text-foreground">Visual Activation™</h2>
              <Badge variant={isComplete ? 'default' : 'secondary'}>{isComplete ? 'Completed' : 'Ready'}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Prepare your eyes and brain for high-speed reading.</p>
            <p className="mt-1 text-xs text-muted-foreground">Estimated Time: 10–15 Minutes</p>
          </div>

          <Button asChild size="sm" className="shrink-0">
            <Link href="/labs/visual-intelligence/visual-activation">Start Visual Activation</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
