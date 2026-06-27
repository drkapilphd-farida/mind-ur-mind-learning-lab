import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoginForm } from '@/features/auth/components/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

type LoginPageProps = {
  searchParams: Promise<{ next?: string; message?: string }>
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
      <AuthCard
        title="Welcome back"
        description="Sign in to your Mind Ur Mind account"
      >
        <LoginForm next={params.next} />
      </AuthCard>
    </div>
  )
}
