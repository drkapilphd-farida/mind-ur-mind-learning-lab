import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSchoolForUser } from '@/features/school-dashboard/queries/getSchoolForUser'
import { getBillingHistoryForSchool } from '@/features/school-dashboard/queries/getBillingHistoryForSchool'
import { BillingSummaryCard } from '@/features/school-dashboard/components/BillingSummaryCard'
import { BillingHistoryTable } from '@/features/school-dashboard/components/BillingHistoryTable'

export const metadata: Metadata = { title: 'Billing' }

export default async function PartnerBillingPage(): Promise<React.JSX.Element> {
  const membership = await getSchoolForUser()

  if (membership === null || membership.member.role === 'student' || membership.school.type !== 'franchise_partner') {
    redirect('/dashboard')
  }

  const { school } = membership
  const billingEvents = await getBillingHistoryForSchool(school.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your current plan, payment status, and billing history.</p>
      </div>

      <BillingSummaryCard tier={school.tier} paymentStatus={school.paymentStatus} expiresAt={school.expiresAt} />

      <div className="space-y-3">
        <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">Billing history</h2>
        <BillingHistoryTable events={billingEvents} />
      </div>
    </div>
  )
}
