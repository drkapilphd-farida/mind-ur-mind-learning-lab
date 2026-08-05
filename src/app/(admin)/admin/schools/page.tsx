import type { Metadata } from 'next'
import { TenantsTable } from '@/features/school-dashboard/components/TenantsTable'

export const metadata: Metadata = { title: 'Schools — Admin' }

export default function AdminSchoolsPage(): React.JSX.Element {
  return <TenantsTable type="school" newHref="/admin/schools/new" />
}
