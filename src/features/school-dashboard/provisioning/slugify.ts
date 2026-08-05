// No node-only imports — safe to import from client components (e.g. to
// preview a generated username client-side) as well as server code,
// unlike generateUniqueCredentials.ts (which pulls in node:crypto).
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '') || 'x'
  )
}
