'use client'

import React, { useTransition } from 'react'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createCheckoutSession } from '@/features/billing/actions/createCheckoutSession'

type BuyButtonProps = {
  courseId: string
  priceCents: number
  isAuthenticated: boolean
  loginHref: string
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function BuyButton({
  courseId,
  priceCents,
  isAuthenticated,
  loginHref,
}: BuyButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  function handleBuy(): void {
    if (!isAuthenticated) {
      window.location.href = loginHref
      return
    }

    startTransition(async () => {
      const result = await createCheckoutSession({ courseId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      window.location.href = result.url
    })
  }

  return (
    <Button size="lg" onClick={handleBuy} disabled={isPending}>
      <ShoppingCart className="size-4" />
      {isPending
        ? 'Redirecting to checkout…'
        : `Buy for ${formatPrice(priceCents)}`}
    </Button>
  )
}
