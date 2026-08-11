import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { cn } from '@/lib/utils'

type BrandWatermarkProps = {
  className?: string
}

// A tiny, permanent "Mind Ur Mind" badge for exercise/reading-tool screens
// that otherwise strip away all normal app chrome (no Topbar/AppSidebar,
// where the Living Brain™ mark usually lives). Deliberately understated —
// low opacity, small type, non-interactive — so it identifies the brand
// without ever competing with the exercise itself for attention. Meant to
// be positioned by the caller (each screen's own corner convention
// differs slightly), not self-positioning.
export function BrandWatermark({ className }: BrandWatermarkProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none inline-flex select-none items-center gap-1.5 rounded-full border border-border/40 bg-background/60 px-2.5 py-1 opacity-60 backdrop-blur-sm',
        className,
      )}
    >
      <LivingBrainLogo size={13} animated={false} />
      <span className="text-[9px] font-medium tracking-wide text-muted-foreground">Mind Ur Mind</span>
    </div>
  )
}
