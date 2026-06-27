import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { SignUpForm } from '@/features/auth/components/SignUpForm'

export const metadata: Metadata = {
  title: 'Create Account',
}

export default function SignUpPage(): React.JSX.Element {
  return (
    <AuthCard
      title="Create your account"
      description="Start learning with AI-powered courses"
    >
      <SignUpForm />
    </AuthCard>
  )
}
