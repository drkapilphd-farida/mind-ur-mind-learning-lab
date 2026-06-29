export function ExerciseLoadingScreen(): React.JSX.Element {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <div
        aria-hidden="true"
        className="size-3 rounded-full bg-primary/40"
        style={{ animation: 'exercise-reduced-motion-pulse 1.6s ease-in-out infinite' }}
      />
      <span className="sr-only">Loading practice…</span>
    </div>
  )
}
