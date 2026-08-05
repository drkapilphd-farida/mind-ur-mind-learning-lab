'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClass } from '../actions/createClass'
import { TENANT_COPY } from '../tenantCopy'
import type { SchoolType } from '../types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const CreateClassFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type CreateClassFormInput = z.infer<typeof CreateClassFormSchema>

type CreateClassFormProps = {
  schoolId: string
  tenantType: SchoolType
}

export function CreateClassForm({ schoolId, tenantType }: CreateClassFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const copy = TENANT_COPY[tenantType]

  const form = useForm<CreateClassFormInput>({
    resolver: zodResolver(CreateClassFormSchema),
    defaultValues: { name: '' },
  })

  function handleSubmit(values: CreateClassFormInput): void {
    startTransition(async () => {
      const result = await createClass({ schoolId, name: values.name, gradeLevel: null, section: null })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`${values.name} created`)
      form.reset({ name: '' })
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-end gap-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>{copy.groupLabel} name</FormLabel>
              <FormControl>
                <Input placeholder={tenantType === 'franchise_partner' ? 'Batch 2026-A' : 'Class 6-A'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Adding…' : `Add ${copy.groupLabel.toLowerCase()}`}
        </Button>
      </form>
    </Form>
  )
}
