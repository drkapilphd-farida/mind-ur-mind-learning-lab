'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { ForgotPasswordSchema, type ForgotPasswordInput } from '../types'
import { resetPassword } from '../actions/resetPassword'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ForgotPasswordForm(): React.JSX.Element {
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  })

  function handleSubmit(values: ForgotPasswordInput): void {
    startTransition(async () => {
      const result = await resetPassword(values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm">
          Check your email — a reset link is on its way.
        </p>
        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground text-sm hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send reset link'}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Remembered it?{' '}
          <Link
            href="/login"
            className="text-foreground font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  )
}
