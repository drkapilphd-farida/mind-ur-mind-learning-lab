'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Award } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { claimCertificate } from '@/features/certificates/actions/claimCertificate'

type ClaimCertificateButtonProps = {
  courseId: string
}

export function ClaimCertificateButton({
  courseId,
}: ClaimCertificateButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClaim(): void {
    startTransition(async () => {
      const result = await claimCertificate({ courseId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      router.push(`/certificates/${result.token}`)
    })
  }

  return (
    <Button onClick={handleClaim} disabled={isPending}>
      <Award className="size-4" />
      {isPending ? 'Issuing certificate…' : 'Claim your certificate'}
    </Button>
  )
}
