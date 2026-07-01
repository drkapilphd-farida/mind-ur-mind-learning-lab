'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { enrollInCourse } from '../actions/enroll'

type EnrollButtonProps = {
  courseId: string
  isAuthenticated: boolean
  loginHref: string
}

export function EnrollButton({
  courseId,
  isAuthenticated,
  loginHref,
}: EnrollButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <Button asChild size="lg">
        <Link href={loginHref}>Sign in to enroll</Link>
      </Button>
    )
  }

  function handleEnroll(): void {
    startTransition(async () => {
      const result = await enrollInCourse(courseId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Enrolled! Start learning below.')
      router.refresh()
    })
  }

  return (
    <Button size="lg" onClick={handleEnroll} disabled={isPending}>
      {isPending ? 'Enrolling…' : "Enroll now — it's free"}
    </Button>
  )
}
