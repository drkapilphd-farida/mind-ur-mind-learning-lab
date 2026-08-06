import { getTenantsOverviewRows } from '../queries/getTenantsOverviewRows'
import type { SchoolType } from '../types'
import { TenantsTableClient } from './TenantsTableClient'

type TenantsTableProps = {
  type: SchoolType
  newHref: string
}

// Shared by /admin/schools and /admin/partners — same schools table,
// filtered by tenant type, so partners never leak into the schools list
// (or vice versa) even though both live in the same table. Data fetch
// lives in getTenantsOverviewRows.ts (shared with the admin overview
// page's Quick Actions toolbar); this just filters to one type and
// hands the already-safe rows down to TenantsTableClient for
// interactive search/filter/sort.
export async function TenantsTable({ type, newHref }: TenantsTableProps): Promise<React.JSX.Element> {
  const rows = await getTenantsOverviewRows(type)
  return <TenantsTableClient type={type} newHref={newHref} rows={rows} />
}
