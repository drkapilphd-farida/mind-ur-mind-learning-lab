'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import type { AuthActionResult } from '@/features/auth/types'

type PublishToggleProps = {
  isPublished: boolean
  toggleAction: () => Promise<AuthActionResult>
}

export function PublishToggle({
  isPublished,
  toggleAction,
}: PublishToggleProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle(): void {
    startTransition(async () => {
      const result = await toggleAction()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Badge variant={isPublished ? 'default' : 'secondary'}>
        {isPending ? '…' : isPublished ? 'Published' : 'Draft'}
      </Badge>
    </button>
  )
}
