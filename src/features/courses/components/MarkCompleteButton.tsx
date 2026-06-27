'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { markComplete } from '../actions/markComplete'

type MarkCompleteButtonProps = {
  lessonId: string
  isCompleted: boolean
}

export function MarkCompleteButton({
  lessonId,
  isCompleted,
}: MarkCompleteButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle(): void {
    startTransition(async () => {
      const result = await markComplete(lessonId, !isCompleted)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <Button
      variant={isCompleted ? 'outline' : 'default'}
      onClick={handleToggle}
      disabled={isPending}
      className={isCompleted ? 'text-green-600' : undefined}
    >
      {isCompleted ? (
        <>
          <CheckCircle className="size-4" />
          {isPending ? 'Updating…' : 'Completed'}
        </>
      ) : (
        <>
          <Circle className="size-4" />
          {isPending ? 'Updating…' : 'Mark complete'}
        </>
      )}
    </Button>
  )
}
