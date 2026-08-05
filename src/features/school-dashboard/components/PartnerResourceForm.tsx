'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createPartnerResource } from '../actions/createPartnerResource'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PartnerResourceFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string(),
  resourceType: z.enum(['zoom_session', 'marketing_material', 'sales_guide']),
  url: z.string().url('Please enter a valid URL'),
  scheduledAt: z.string(),
})

type PartnerResourceFormInput = z.infer<typeof PartnerResourceFormSchema>

const RESOURCE_TYPE_LABELS: Record<PartnerResourceFormInput['resourceType'], string> = {
  zoom_session: 'Live Zoom training',
  marketing_material: 'Marketing material',
  sales_guide: 'Sales guide',
}

export function PartnerResourceForm(): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<PartnerResourceFormInput>({
    resolver: zodResolver(PartnerResourceFormSchema),
    defaultValues: { title: '', description: '', resourceType: 'zoom_session', url: '', scheduledAt: '' },
  })

  function handleSubmit(values: PartnerResourceFormInput): void {
    startTransition(async () => {
      const result = await createPartnerResource({
        title: values.title,
        description: values.description.trim() === '' ? null : values.description.trim(),
        resourceType: values.resourceType,
        url: values.url,
        scheduledAt: values.scheduledAt === '' ? null : new Date(values.scheduledAt).toISOString(),
        displayOrder: 0,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Resource added')
      router.push('/admin/partner-resources')
      router.refresh()
    })
  }

  const resourceType = form.watch('resourceType')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="resourceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Monthly Partner Onboarding Call" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://zoom.us/j/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {resourceType === 'zoom_session' && (
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled for</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adding…' : 'Add resource'}
        </Button>
      </form>
    </Form>
  )
}
