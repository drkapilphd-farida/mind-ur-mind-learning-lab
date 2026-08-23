export default function Loading(): React.JSX.Element {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-px bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>

      {/* Content row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-md bg-muted" />
            <div className="aspect-video animate-pulse rounded-xl bg-muted" />
            <div className="space-y-2 pt-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside className="hidden w-80 shrink-0 flex-col border-l lg:flex">
          <div className="h-12 animate-pulse bg-muted/30 border-b" />
          <div className="flex-1 animate-pulse bg-muted/10" />
        </aside>
      </div>

      {/* Footer */}
      <div className="flex h-16 shrink-0 items-center justify-between border-t px-6">
        <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}
