import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { TenantSignInForm } from '@/features/school-dashboard/components/TenantSignInForm'
import { PortalAuthShell } from '@/features/school-dashboard/components/PortalAuthShell'

export const metadata: Metadata = { title: 'School Admin Sign In' }

type SchoolAdminLoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

// Sits outside (protected)/layout.tsx on purpose — that layout requires
// a signed-in session, which would make this page unreachable for the
// exact visitors who need it. src/middleware.ts carves this path out of
// the protected-prefix check and routes unauthenticated /school-admin/*
// visits here instead of the shared /login page.
export default async function SchoolAdminLoginPage({ searchParams }: SchoolAdminLoginPageProps): Promise<React.JSX.Element> {
  const { next } = await searchParams

  return (
    <PortalAuthShell>
      <AuthCard title="School Admin Sign In" description="Sign in to manage your school's classes, students, and branding">
        <TenantSignInForm type="school" next={next} />
      </AuthCard>
    </PortalAuthShell>
  )
}
