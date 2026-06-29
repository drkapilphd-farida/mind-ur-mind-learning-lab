import { cn } from '@/lib/utils'

type LoadingCardProps = {
  className?: string
}

// One pulsing skeleton block — formalizes the `animate-pulse rounded-xl
// bg-muted` pattern already used ad hoc in every route's loading.tsx.
// Existing loading.tsx files are left as-is (they shape skeletons to their
// own page layout); compose several of these for any future skeleton.
export function LoadingCard({ className }: LoadingCardProps): React.JSX.Element {
  return <div className={cn('h-20 animate-pulse rounded-xl bg-muted', className)} aria-hidden="true" />
}
