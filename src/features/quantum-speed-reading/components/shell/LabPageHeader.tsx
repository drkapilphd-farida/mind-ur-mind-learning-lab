import { cn } from '@/lib/utils'

// Sprint-6 — the one canonical "eyebrow + title (+ subtitle)" header, used by
// every browsing-surface page (hub, dashboard, intelligence/*, reports/*).
// Before this, every page hand-rolled its own eyebrow/title classes, which
// had drifted (tracking-wide vs tracking-widest vs tracking-wider; font-bold
// vs font-semibold). These are now the single source of truth:
export const LAB_EYEBROW_CLASS = 'text-xs font-medium tracking-widest text-muted-foreground uppercase'
export const LAB_TITLE_CLASS = 'mt-2 font-heading text-3xl font-bold tracking-tight text-foreground'
export const LAB_CARD_CLASS = 'rounded-2xl border bg-card p-6 shadow-sm'
export const LAB_STAT_LABEL_CLASS = 'text-xs font-medium tracking-widest text-muted-foreground uppercase'

type LabPageHeaderProps = {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

export function LabPageHeader({ eyebrow, title, subtitle, align = 'center', className }: LabPageHeaderProps): React.JSX.Element {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', className)}>
      <p className={LAB_EYEBROW_CLASS}>{eyebrow}</p>
      <h1 className={LAB_TITLE_CLASS}>{title}</h1>
      {subtitle && <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
