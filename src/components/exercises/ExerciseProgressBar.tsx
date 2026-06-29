type ExerciseProgressBarProps = {
  progress: number
}

export function ExerciseProgressBar({ progress }: ExerciseProgressBarProps): React.JSX.Element {
  const clamped = Math.min(1, Math.max(0, progress))

  return (
    <div
      role="progressbar"
      aria-label="Practice progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className="h-1 w-full overflow-hidden rounded-full bg-foreground/10"
    >
      <div
        className="h-full rounded-full bg-primary/40 transition-[width] duration-300 ease-linear"
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  )
}
