import type { Metadata } from 'next'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { TenantSignInForm } from '@/features/school-dashboard/components/TenantSignInForm'
import { PortalAuthShell } from '@/features/school-dashboard/components/PortalAuthShell'

export const metadata: Metadata = { title: 'Partner Sign In' }

type PartnerAdminLoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

// Sits outside (protected)/layout.tsx on purpose — see the identical
// note in school-admin/login/page.tsx.
export default async function PartnerAdminLoginPage({ searchParams }: PartnerAdminLoginPageProps): Promise<React.JSX.Element> {
  const { next } = await searchParams

  return (
    <PortalAuthShell>
      <AuthCard title="Partner Sign In" description="Sign in to manage your academy's batches, students, and resources">
        <TenantSignInForm type="franchise_partner" next={next} />
      </AuthCard>
    </PortalAuthShell>
  )
}
