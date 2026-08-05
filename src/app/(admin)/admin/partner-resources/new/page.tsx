import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PartnerResourceForm } from '@/features/school-dashboard/components/PartnerResourceForm'

export const metadata: Metadata = { title: 'New Partner Resource — Admin' }

export default function NewPartnerResourcePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/partner-resources"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to resources
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New partner resource</h1>
      </div>

      <PartnerResourceForm />
    </div>
  )
}
