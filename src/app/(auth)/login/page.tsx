import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoginForm } from '@/features/auth/components/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string; message?: string; error?: string }>
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const params = await searchParams

  return (
    <div className="space-y-4">
      {params.message === 'check-email' && (
        <p className="bg-muted rounded-md px-4 py-3 text-center text-sm">
          Check your email to confirm your account, then sign in.
        </p>
      )}
      {params.error === 'invalid-link' && (
        <p className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-center text-sm">
          Your link is invalid or has expired.{' '}
          <a href="/forgot-password" className="underline underline-offset-2">
            Request a new one.
          </a>
        </p>
      )}
      <AuthCard
        title="Welcome back"
        description="Sign in to your Mind Ur Mind account"
      >
        <LoginForm next={params.next} />
      </AuthCard>
    </div>
  )
}
