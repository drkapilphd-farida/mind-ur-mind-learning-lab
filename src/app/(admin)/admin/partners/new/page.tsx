import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CreateTenantForm } from '@/features/school-dashboard/components/CreateTenantForm'

export const metadata: Metadata = { title: 'New Partner — Admin' }

export default function NewPartnerPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/partners"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to partners
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New partner</h1>
      </div>

      <CreateTenantForm type="franchise_partner" backHref="/admin/partners" />
    </div>
  )
}
