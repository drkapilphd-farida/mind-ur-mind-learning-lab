'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { AuthActionResult } from '@/features/auth/types'

// All fields required (no .optional()) — avoids exactOptionalPropertyTypes
// conflicts with zodResolver. Empty string signals "no value".
const LessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Only lowercase letters, numbers, and hyphens',
    ),
  content_url: z.string().url('Must be a valid URL').or(z.literal('')),
  duration_seconds: z.number().int().min(0).max(86400),
  sort_order: z.number().int().min(0),
  is_published: z.boolean(),
})

type LessonFormValues = z.infer<typeof LessonSchema>

type LessonFormProps = {
  defaultValues?: LessonFormValues | undefined
  action: (input: unknown) => Promise<AuthActionResult>
  submitLabel: string
  cancelHref: string
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function LessonForm({
  defaultValues,
  action,
  submitLabel,
  cancelHref,
}: LessonFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(LessonSchema),
    defaultValues: defaultValues ?? {
      title: '',
      slug: '',
      content_url: '',
      duration_seconds: 0,
      sort_order: 0,
      is_published: false,
    },
  })

  function handleTitleBlur(title: string): void {
    if (form.getValues('slug') === '') {
      form.setValue('slug', toSlug(title), { shouldValidate: true })
    }
  }

  function onSubmit(values: LessonFormValues): void {
    startTransition(async () => {
      const result = await action(values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Lesson saved.')
      router.push(cancelHref)
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Introduction and setup"
                  onBlur={() => handleTitleBlur(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="introduction-and-setup" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://youtube.com/watch?v=…"
                  type="url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration_seconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={86400}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <input
            id="is_published"
            type="checkbox"
            checked={form.watch('is_published')}
            onChange={(e) => form.setValue('is_published', e.target.checked)}
            className="h-4 w-4 rounded border"
          />
          <label
            htmlFor="is_published"
            className="cursor-pointer text-sm font-medium"
          >
            Publish lesson
            <span className="text-muted-foreground ml-2 font-normal">
              (visible to enrolled students)
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelHref)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
