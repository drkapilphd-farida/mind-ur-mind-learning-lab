type StatCardProps = {
  label: string
  value: number | string
  description?: string | undefined
}

export function StatCard({
  label,
  value,
  description,
}: StatCardProps): React.JSX.Element {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2.5 text-3xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      {description !== undefined && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
