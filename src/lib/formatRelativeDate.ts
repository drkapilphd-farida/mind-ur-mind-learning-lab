// Shared by any page showing a timestamp as "Today" / "3d ago" / etc. —
// extracted from the Progress page so the Dashboard doesn't redefine it.
export function formatRelativeDate(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  const weeks = Math.floor(diffDays / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(diffDays / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}
