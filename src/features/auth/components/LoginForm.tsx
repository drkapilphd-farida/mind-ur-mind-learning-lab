'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { SignInSchema, type SignInInput } from '../types'
import { signIn } from '../actions/signIn'
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

type LoginFormProps = {
  next?: string | undefined
  // Mirrors SignUpForm's onSwitchToLogin — provided only by the Gateway
  // Auth Modal, so "Sign up" switches mode in place instead of navigating
  // to /signup.
  onSwitchToSignup?: (() => void) | undefined
}

export function LoginForm({ next, onSwitchToSignup }: LoginFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()

  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  })

  function handleSubmit(values: SignInInput): void {
    startTransition(async () => {
      const result = await signIn(values, next)
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{' '}
            {onSwitchToSignup ? (
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-foreground font-medium hover:underline"
              >
                Sign up
              </button>
            ) : (
              <Link
                href="/signup"
                className="text-foreground font-medium hover:underline"
              >
                Sign up
              </Link>
            )}
          </p>
        </form>
      </Form>
    </div>
  )
}
