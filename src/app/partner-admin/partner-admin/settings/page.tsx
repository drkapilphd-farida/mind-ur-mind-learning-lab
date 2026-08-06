import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSchoolForUser } from '@/features/school-dashboard/queries/getSchoolForUser'
import { BrandingForm } from '@/features/school-dashboard/components/BrandingForm'

export const metadata: Metadata = { title: 'Branding — Partner Dashboard' }

export default async function PartnerAdminSettingsPage(): Promise<React.JSX.Element> {
  const membership = await getSchoolForUser()

  if (membership === null || membership.member.role === 'student' || membership.school.type !== 'franchise_partner') {
    redirect('/dashboard')
  }

  const { school } = membership

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Branding</h1>
      <BrandingForm schoolId={school.id} tenantType={school.type} currentName={school.name} currentLogoUrl={school.logoUrl} />
    </div>
  )
}
