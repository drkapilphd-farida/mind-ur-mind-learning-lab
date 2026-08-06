'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { tenantSignIn } from '../actions/tenantSignIn'
import { TENANT_COPY } from '../tenantCopy'
import type { SchoolType } from '../types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const TenantSignInFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type TenantSignInFormInput = z.infer<typeof TenantSignInFormSchema>

type TenantSignInFormProps = {
  type: SchoolType
  next?: string | undefined
}

export function TenantSignInForm({ type, next }: TenantSignInFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const copy = TENANT_COPY[type]

  const form = useForm<TenantSignInFormInput>({
    resolver: zodResolver(TenantSignInFormSchema),
    defaultValues: { email: '', password: '' },
  })

  function handleSubmit(values: TenantSignInFormInput): void {
    startTransition(async () => {
      const result = await tenantSignIn(values, type, next)
      toast.error(result.error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.adminRoleLabel} email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  )
}
