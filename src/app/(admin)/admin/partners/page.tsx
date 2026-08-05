import type { Metadata } from 'next'
import { TenantsTable } from '@/features/school-dashboard/components/TenantsTable'

export const metadata: Metadata = { title: 'Partners — Admin' }

export default function AdminPartnersPage(): React.JSX.Element {
  return <TenantsTable type="franchise_partner" newHref="/admin/partners/new" />
}
