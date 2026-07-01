export default function Loading(): React.JSX.Element {
  return (
    <div>
      {/* Course hero */}
      <div className="bg-muted/30 py-12">
        <div className="mx-auto max-w-4xl space-y-4 px-4">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-2/3 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
