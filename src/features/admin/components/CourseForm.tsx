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

// All fields required (no .optional()) to avoid exactOptionalPropertyTypes
// conflicts with zodResolver. Empty string signals "no value" — server
// action converts '' to null.
const CourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Only lowercase letters, numbers, and hyphens',
    ),
  description: z.string().max(2000),
  thumbnail_url: z.string().url('Must be a valid URL').or(z.literal('')),
  is_published: z.boolean(),
  price_cents: z.number().int().min(0),
})

type CourseFormValues = z.infer<typeof CourseSchema>

type CourseFormProps = {
  defaultValues?: CourseFormValues | undefined
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

export function CourseForm({
  defaultValues,
  action,
  submitLabel,
  cancelHref,
}: CourseFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(CourseSchema),
    defaultValues: defaultValues ?? {
      title: '',
      slug: '',
      description: '',
      thumbnail_url: '',
      is_published: false,
      price_cents: 0,
    },
  })

  function handleTitleBlur(title: string): void {
    if (form.getValues('slug') === '') {
      form.setValue('slug', toSlug(title), { shouldValidate: true })
    }
  }

  function onSubmit(values: CourseFormValues): void {
    startTransition(async () => {
      const result = await action(values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Course saved.')
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
                  placeholder="Introduction to React"
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
                <Input {...field} placeholder="introduction-to-react" />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="A brief overview of this course…"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnail_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price_cents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (cents) — 0 = free</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                  placeholder="0"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                e.g. 1999 = $19.99. Set to 0 for a free course.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

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
            Publish course
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
