import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { UpdatePasswordForm } from '@/features/user/components/UpdatePasswordForm'

export const metadata: Metadata = {
  title: 'Set New Password',
}

export default async function UpdatePasswordPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a strong password for your account"
    >
      <UpdatePasswordForm redirectAfterSuccess="/dashboard" />
    </AuthCard>
  )
}
