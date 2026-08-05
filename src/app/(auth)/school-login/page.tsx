import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { StudentSignInForm } from '@/features/school-dashboard/components/StudentSignInForm'

export const metadata: Metadata = {
  title: 'Student Sign In',
}

export default function SchoolLoginPage(): React.JSX.Element {
  return (
    <AuthCard title="Student sign in" description="Enter the username and password your school gave you">
      <StudentSignInForm />
    </AuthCard>
  )
}
