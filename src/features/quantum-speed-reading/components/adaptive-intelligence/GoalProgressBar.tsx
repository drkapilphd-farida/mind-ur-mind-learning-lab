import { cn } from '@/lib/utils'

type GoalProgressBarProps = {
  label: string
  percent: number
  className?: string
}

export function GoalProgressBar({ label, percent, className }: GoalProgressBarProps): React.JSX.Element {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-2 w-full overflow-hidden rounded-full bg-foreground/10"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
