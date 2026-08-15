// A small, reusable section label — the mechanism behind the dashboard's
// "My Document Tools" vs. "Masterclass & Programs" sectional grouping
// (3-Tier Value Ladder™ re-architecture). Deliberately plain sectional
// headers rather than a tabbed interface: tabs would hide one tier behind
// a click, which is the opposite of what a "no confusion, no clutter"
// dashboard needs — every tier stays visible on scroll.
type DashboardSectionHeaderProps = {
  id: string
  eyebrow: string
  title: string
  description?: string
  children?: React.ReactNode
}

export function DashboardSectionHeader({ id, eyebrow, title, description, children }: DashboardSectionHeaderProps): React.JSX.Element {
  return (
    <div className="mb-3 flex flex-col gap-2 px-1">
      <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
        {eyebrow}
      </span>
      <h2 id={id} className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
        {title}
      </h2>
      {description && <p className="max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">{description}</p>}
      {children}
    </div>
  )
}
