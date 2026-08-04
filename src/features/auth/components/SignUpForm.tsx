'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { SignUpSchema, type SignUpInput } from '../types'
import { signUp } from '../actions/signUp'
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
import { GoogleSignInButton } from './GoogleSignInButton'
import { AuthDivider } from './AuthDivider'

type SignUpFormProps = {
  next?: string | undefined
  // When provided (the Gateway Auth Modal's usage), the "Already have an
  // account? Sign in" line switches mode in place instead of navigating to
  // /login — staying in the modal rather than leaving it. Omitted on the
  // standalone /signup page, where a real navigation is correct.
  onSwitchToLogin?: (() => void) | undefined
}

export function SignUpForm({ next, onSwitchToLogin }: SignUpFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  })

  function handleSubmit(values: SignUpInput): void {
    startTransition(async () => {
      const result = await signUp(values, next)
      toast.error(result.error)
    })
  }

  return (
    <div className="space-y-4">
      <GoogleSignInButton next={next} />
      <AuthDivider label="or continue with email" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Smith"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-foreground font-medium hover:underline"
              >
                Sign in
              </button>
            ) : (
              <Link
                href="/login"
                className="text-foreground font-medium hover:underline"
              >
                Sign in
              </Link>
            )}
          </p>
        </form>
      </Form>
    </div>
  )
}
