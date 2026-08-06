'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { updateTenantLimits } from '../actions/updateTenantLimits'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Kept as strings all the way through the form (matching what a plain
// <input type="number"> actually produces via react-hook-form's field
// spread) and converted to numbers only when calling the action —
// z.coerce.number() here fights zodResolver's generic inference under
// this project's exactOptionalPropertyTypes: true.
const TenantLimitsFormSchema = z.object({
  maxStudents: z.string().regex(/^\d+$/, 'Must be a whole number').refine((value) => Number(value) >= 1, 'Must allow at least 1 student'),
  monthlyAiQuota: z.string().regex(/^\d+$/, 'Must be a whole number'),
  expiresAt: z.string(),
})

type TenantLimitsFormInput = z.infer<typeof TenantLimitsFormSchema>

type TenantLimitsFormProps = {
  schoolId: string
  maxStudents: number
  monthlyAiQuota: number
  expiresAt: string | null
}

function toDateInputValue(iso: string | null): string {
  return iso === null ? '' : iso.slice(0, 10)
}

// The master admin's three controls the plan bundled into one action —
// seat limit, AI quota ("credits"), and subscription expiry are three
// fields on the same schools row, not three separate mechanisms.
export function TenantLimitsForm({ schoolId, maxStudents, monthlyAiQuota, expiresAt }: TenantLimitsFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<TenantLimitsFormInput>({
    resolver: zodResolver(TenantLimitsFormSchema),
    defaultValues: {
      maxStudents: String(maxStudents),
      monthlyAiQuota: String(monthlyAiQuota),
      expiresAt: toDateInputValue(expiresAt),
    },
  })

  function handleSubmit(values: TenantLimitsFormInput): void {
    startTransition(async () => {
      const result = await updateTenantLimits({
        schoolId,
        maxStudents: Number(values.maxStudents),
        monthlyAiQuota: Number(values.monthlyAiQuota),
        expiresAt: values.expiresAt,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Updated')
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="maxStudents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seat limit</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthlyAiQuota"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly AI document quota</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription expires on</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>Leave blank for no expiry.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
}
