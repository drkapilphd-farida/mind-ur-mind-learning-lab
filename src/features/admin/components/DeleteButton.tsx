'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { AuthActionResult } from '@/features/auth/types'

type DeleteButtonProps = {
  label: string
  deleteAction: () => Promise<AuthActionResult>
  redirectTo?: string | undefined
}

export function DeleteButton({
  label,
  deleteAction,
  redirectTo,
}: DeleteButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(): void {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteAction()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`"${label}" deleted.`)
      if (redirectTo !== undefined) {
        router.push(redirectTo)
      }
      router.refresh()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="size-4" />
      <span className="sr-only">Delete {label}</span>
    </Button>
  )
}
