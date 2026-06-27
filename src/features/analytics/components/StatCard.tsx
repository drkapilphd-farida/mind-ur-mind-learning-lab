type StatCardProps = {
  label: string
  value: number
  description?: string | undefined
}

export function StatCard({
  label,
  value,
  description,
}: StatCardProps): React.JSX.Element {
  return (
    <div className="bg-card rounded-xl border p-5">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
      {description !== undefined && (
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      )}
    </div>
  )
}
