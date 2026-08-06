import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSchoolForUser } from '@/features/school-dashboard/queries/getSchoolForUser'
import { getClassesForUser } from '@/features/school-dashboard/queries/getClassesForUser'
import { getSchoolMembers } from '@/features/school-dashboard/queries/getSchoolMembers'
import { TenantHomeContent } from '@/features/school-dashboard/components/TenantHomeContent'

export const metadata: Metadata = { title: 'Partner Dashboard' }

export default async function PartnerAdminHomePage(): Promise<React.JSX.Element> {
  const membership = await getSchoolForUser()

  // The layout above already redirects unauthenticated/non-member/
  // student/wrong-tenant-type requests — this is defense-in-depth, not
  // the primary gate.
  if (membership === null || membership.member.role === 'student' || membership.school.type !== 'franchise_partner') {
    redirect('/dashboard')
  }

  const { school } = membership

  const [classes, members] = await Promise.all([getClassesForUser(school.id), getSchoolMembers(school.id)])
  const studentCount = members.filter((member) => member.role === 'student').length

  return <TenantHomeContent school={school} classes={classes} studentCount={studentCount} />
}
