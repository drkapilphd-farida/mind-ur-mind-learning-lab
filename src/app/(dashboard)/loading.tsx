export default function Loading(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      </div>

      {/* Continue Learning hero */}
      <div className="h-36 animate-pulse rounded-xl bg-muted" />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>

      {/* Course cards */}
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  )
}
