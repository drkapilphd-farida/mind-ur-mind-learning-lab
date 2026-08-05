import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CreateTenantForm } from '@/features/school-dashboard/components/CreateTenantForm'

export const metadata: Metadata = { title: 'New School — Admin' }

export default function NewSchoolPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/admin/schools"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to schools
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New school</h1>
      </div>

      <CreateTenantForm type="school" backHref="/admin/schools" />
    </div>
  )
}
