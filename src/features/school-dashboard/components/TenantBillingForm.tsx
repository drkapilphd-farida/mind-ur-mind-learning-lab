'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Link2Off } from 'lucide-react'
import { linkRazorpaySubscription } from '../actions/linkRazorpaySubscription'
import { unlinkRazorpaySubscription } from '../actions/unlinkRazorpaySubscription'
import { PAYMENT_STATUS_BADGE } from '../billing'
import type { BillingCycle, PaymentStatus } from '../types'
import { StatusBadge } from '@/components/ui/status-badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const TenantBillingFormSchema = z.object({
  razorpaySubscriptionId: z.string().trim().min(1, 'Subscription ID is required'),
  billingCycle: z.enum(['monthly', 'yearly']),
})

type TenantBillingFormInput = z.infer<typeof TenantBillingFormSchema>

type TenantBillingFormProps = {
  schoolId: string
  razorpaySubscriptionId: string | null
  billingCycle: BillingCycle | null
  paymentStatus: PaymentStatus
}

// The master admin's billing control: link an already-created Razorpay
// subscription (dashboard or hosted Subscription Link — see
// linkRazorpaySubscription.ts's own comment) to this tenant, or unlink
// one that was mislinked. payment_status itself is read-only here — it
// only ever changes via the webhook (or reset to 'unlinked' by
// unlinking), never by a direct admin edit, so the badge always reflects
// what Razorpay actually reported.
export function TenantBillingForm({ schoolId, razorpaySubscriptionId, billingCycle, paymentStatus }: TenantBillingFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const badge = PAYMENT_STATUS_BADGE[paymentStatus]

  const form = useForm<TenantBillingFormInput>({
    resolver: zodResolver(TenantBillingFormSchema),
    defaultValues: { razorpaySubscriptionId: '', billingCycle: 'monthly' },
  })

  function handleLink(values: TenantBillingFormInput): void {
    startTransition(async () => {
      const result = await linkRazorpaySubscription({ schoolId, ...values })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Subscription linked — waiting for Razorpay to confirm activation.')
      form.reset({ razorpaySubscriptionId: '', billingCycle: 'monthly' })
      router.refresh()
    })
  }

  function handleUnlink(): void {
    if (!window.confirm('Unlink this subscription? Payment status will reset to "Not linked" until a new one is linked.')) return
    startTransition(async () => {
      const result = await unlinkRazorpaySubscription({ schoolId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Subscription unlinked')
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={badge.status} label={badge.label} />
        {billingCycle !== null && <span className="text-muted-foreground text-sm capitalize">{billingCycle} billing</span>}
      </div>

      {razorpaySubscriptionId !== null ? (
        <div className="space-y-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Linked subscription</p>
            <p className="font-mono text-sm">{razorpaySubscriptionId}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleUnlink} disabled={isPending}>
            <Link2Off className="size-4" />
            Unlink subscription
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLink)} className="max-w-sm space-y-4">
            <FormField
              control={form.control}
              name="razorpaySubscriptionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razorpay subscription ID</FormLabel>
                  <FormControl>
                    <Input placeholder="sub_XXXXXXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing cycle</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Linking…' : 'Link subscription'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
