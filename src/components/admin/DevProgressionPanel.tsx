'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RotateCcw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  devCompleteReadingExercise,
  devResetReadingProgress,
  type DevToolResult,
} from '@/lib/exercises/actions/devProgressionTools'

type SequenceItem = { exerciseId: string; title: string }

type DevProgressionPanelProps = {
  sequence: SequenceItem[]
  initialStatus: Record<string, string>
  initialAvailability: Record<string, string>
}

const AVAILABILITY_STYLE: Record<string, string> = {
  completed: 'text-success',
  current: 'text-foreground font-semibold',
  locked: 'text-muted-foreground',
}

// This panel never computes availability itself — it only ever displays
// whatever the server (getModuleProgress, via the page's own props) says,
// and asks Next.js to re-fetch that after every action via router.refresh().
export function DevProgressionPanel({ sequence, initialStatus, initialAvailability }: DevProgressionPanelProps): React.JSX.Element {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function runAction(action: () => Promise<DevToolResult>): void {
    startTransition(async () => {
      const result = await action()
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-2 pt-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Current chain state</p>
          <ul className="space-y-1">
            {sequence.map((item) => (
              <li key={item.exerciseId} className="flex items-center justify-between text-sm">
                <span>{item.title}</span>
                <span className={AVAILABILITY_STYLE[initialAvailability[item.exerciseId] ?? 'locked']}>
                  {initialStatus[item.exerciseId] === 'completed' ? 'Completed' : (initialAvailability[item.exerciseId] ?? 'locked')}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <p className="text-xs font-medium text-muted-foreground">
            Each button calls the real <code>savePracticeSession()</code> for that exact exercise — the same
            write path a genuine completion uses. Clicking one that isn&apos;t actually unlocked yet is rejected by
            the same guard a real session would hit.
          </p>

          {sequence.map((item) => {
            const isLocked = initialAvailability[item.exerciseId] === 'locked'
            return (
              <Button
                key={item.exerciseId}
                className="w-full justify-start gap-2"
                variant="outline"
                disabled={isPending || isLocked}
                onClick={() => runAction(() => devCompleteReadingExercise(item.exerciseId))}
              >
                <CheckCircle2 className="size-4" />
                Complete {item.title}
              </Button>
            )
          })}

          <Button
            className="w-full justify-start gap-2"
            variant="destructive"
            disabled={isPending}
            onClick={() => runAction(devResetReadingProgress)}
          >
            <RotateCcw className="size-4" />
            Reset Reading Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
